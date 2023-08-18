import useRealm from 'hooks/useRealm'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ProposalFilter, {
  InitialFilters,
  Filters,
} from 'components/ProposalFilter'
import {
  ProgramAccount,
  Proposal,
  ProposalState,
  Vote,
  VoteType,
  withCastVote,
  YesNoVote,
} from '@solana/spl-governance'
import NewProposalBtn from './proposal/components/NewProposalBtn'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import dynamic from 'next/dynamic'
import PaginationComponent from '@components/Pagination'
import Tabs from '@components/Tabs'
import AboutRealm from '@components/AboutRealm'
import Input from '@components/inputs/Input'
import { SearchIcon } from '@heroicons/react/outline'
import Switch from '@components/Switch'
import ProposalSelectCard from '@components/ProposalSelectCard'
import Checkbox from '@components/inputs/Checkbox'
import Button from '@components/Button'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { notify } from '@utils/notifications'
import { sendSignedTransaction } from '@utils/send'
import { compareProposals, filterProposals } from '@utils/proposals'
import ProposalSorting, {
  InitialSorting,
  PROPOSAL_SORTING_LOCAL_STORAGE_KEY,
  Sorting,
} from '@components/ProposalSorting'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { useRealmGovernancesQuery } from '@hooks/queries/governance'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  proposalQueryKeys,
  useRealmProposalsQuery,
} from '@hooks/queries/proposal'
import queryClient from '@hooks/queries/queryClient'

const AccountsCompactWrapper = dynamic(
  () => import('@components/TreasuryAccount/AccountsCompactWrapper')
)
const AssetsCompactWrapper = dynamic(
  () => import('@components/AssetsList/AssetsCompactWrapper')
)
const NFTSCompactWrapper = dynamic(
  () => import('@components/NFTS/NFTSCompactWrapper')
)
const ProposalCard = dynamic(() => import('components/ProposalCard'))
const RealmHeader = dynamic(() => import('components/RealmHeader'))
const DepositLabel = dynamic(
  () => import('@components/TreasuryAccount/DepositLabel')
)

const REALM = () => {
  const pagination = useRef<{ setPage: (val) => void }>(null)
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realmQuery = useRealmQuery()
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { realmInfo, ownVoterWeight } = useRealm()
  const proposalsPerPage = 20
  const [filters, setFilters] = useState<Filters>(InitialFilters)
  const [sorting, setSorting] = useState<Sorting>(InitialSorting)

  const [paginatedProposals, setPaginatedProposals] = useState<
    [string, ProgramAccount<Proposal>][]
  >([])
  const [isMultiVoting, setIsMultiVoting] = useState(false)
  const [proposalSearch, setProposalSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Proposals')
  const [multiVoteMode, setMultiVoteMode] = useState(false)
  const [selectedProposals, setSelectedProposals] = useState<
    SelectedProposal[]
  >([])

  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const wallet = useWalletOnePointOh()
  const { connection } = useConnection()

  const governancesArray = useRealmGovernancesQuery().data
  const governancesByGovernance = useMemo(
    () =>
      governancesArray &&
      Object.fromEntries(governancesArray.map((x) => [x.pubkey.toString(), x])),
    [governancesArray]
  )
  const { data: proposalsArray } = useRealmProposalsQuery()
  const proposalsByProposal = useMemo(
    () =>
      proposalsArray === undefined
        ? undefined
        : Object.fromEntries(
            proposalsArray.map((x) => [x.pubkey.toString(), x])
          ),
    [proposalsArray]
  )

  const allProposals = useMemo(
    () =>
      governancesByGovernance !== undefined && proposalsByProposal !== undefined
        ? Object.entries(proposalsByProposal ?? {}).sort((a, b) =>
            compareProposals(
              b[1].account,
              a[1].account,
              governancesByGovernance
            )
          )
        : [],
    [governancesByGovernance, proposalsByProposal]
  )

  const onProposalPageChange = (page) => {
    setPaginatedProposals(paginateProposals(page))
  }

  const toggleMultiVoteMode = () => {
    setMultiVoteMode(!multiVoteMode)
  }
  const handleSetSorting = (sorting: Sorting) => {
    localStorage.setItem(
      PROPOSAL_SORTING_LOCAL_STORAGE_KEY,
      JSON.stringify(sorting)
    )
    setSorting(sorting)
  }

  const votingProposals = useMemo(
    () =>
      governancesByGovernance &&
      allProposals?.filter(([_k, v]) => {
        const governance =
          governancesByGovernance[v.account.governance.toBase58()]?.account
        return (
          v.account.state === ProposalState.Voting &&
          v.account.voteType === VoteType.SINGLE_CHOICE &&
          // !getCurrentVoteRecKeyVal()[k] &&
          !v.account.hasVoteTimeEnded(governance)
        )
      }),
    [allProposals, governancesByGovernance]
  )

  const filteredProposals = useMemo(() => {
    if (votingProposals && multiVoteMode) return votingProposals

    let proposals = filterProposals(
      allProposals,
      filters,
      sorting,
      realmQuery.data?.result,
      governancesByGovernance ?? {},
      councilMint,
      mint
    )

    if (proposalSearch) {
      proposals = proposals.filter(([, v]) =>
        v.account.name
          .toLowerCase()
          .includes(proposalSearch.toLocaleLowerCase())
      )
    }
    return proposals
  }, [
    allProposals,
    councilMint,
    filters,
    governancesByGovernance,
    mint,
    multiVoteMode,
    proposalSearch,
    realmQuery.data?.result,
    sorting,
    votingProposals,
  ])

  const paginateProposals = useCallback(
    (page) => {
      return filteredProposals.slice(
        page * proposalsPerPage,
        (page + 1) * proposalsPerPage
      )
    },
    [filteredProposals]
  )

  // TODO stop using side effects
  /** side effect:  */
  useEffect(() => {
    setSelectedProposals([])
  }, [multiVoteMode])

  // TODO stop using side effects
  /** side effect: update sorting based on localstorage */
  useEffect(() => {
    const initialSort = localStorage.getItem(PROPOSAL_SORTING_LOCAL_STORAGE_KEY)
    if (initialSort) {
      const initialSortObj = JSON.parse(initialSort)
      setSorting(initialSortObj)
    }
  }, [])

  const allVotingProposalsSelected =
    selectedProposals.length === votingProposals?.length
  const hasCommunityVoteWeight =
    ownTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(ownTokenRecord.account.governingTokenMint)
  const hasCouncilVoteWeight =
    ownCouncilTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      ownCouncilTokenRecord.account.governingTokenMint
    )

  const cantMultiVote =
    selectedProposals.length === 0 ||
    isMultiVoting ||
    (!hasCommunityVoteWeight && !hasCouncilVoteWeight)

  const toggleSelectAll = () => {
    if (allVotingProposalsSelected) {
      setSelectedProposals([])
    } else {
      setSelectedProposals(
        votingProposals?.map(([k, v]) => ({
          proposal: v.account,
          proposalPk: new PublicKey(k),
        })) ?? []
      )
    }
  }

  const voteOnSelected = async (vote: YesNoVote) => {
    const realm = realmQuery.data?.result
    if (!wallet || !realmInfo!.programId || !realm) return

    const governanceAuthority = wallet.publicKey!
    const payer = wallet.publicKey!

    try {
      setIsMultiVoting(true)
      const {
        blockhash: recentBlockhash,
      } = await connection.getLatestBlockhash()

      const transactions: Transaction[] = []
      for (let i = 0; i < selectedProposals.length; i++) {
        const selectedProposal = selectedProposals[i]
        const relevantTokenRecord =
          selectedProposal.proposal.governingTokenMint.toBase58() ===
          realm.account.communityMint.toBase58()
            ? ownTokenRecord
            : ownCouncilTokenRecord

        if (relevantTokenRecord === undefined)
          throw new Error('token owner record not found or not yet loaded')

        const instructions: TransactionInstruction[] = []

        //will run only if plugin is connected with realm
        const plugin = await client?.withCastPluginVote(
          instructions,
          {
            account: selectedProposal.proposal,
            pubkey: selectedProposal.proposalPk,
            owner: realm.pubkey,
          },
          relevantTokenRecord.pubkey
        )
        if (client.client instanceof NftVoterClient === false) {
          await withCastVote(
            instructions,
            realmInfo!.programId,
            realmInfo!.programVersion!,
            realm.pubkey,
            selectedProposal.proposal.governance,
            selectedProposal.proposalPk,
            selectedProposal.proposal.tokenOwnerRecord,
            relevantTokenRecord.pubkey,
            governanceAuthority,
            selectedProposal.proposal.governingTokenMint,
            Vote.fromYesNoVote(vote),
            payer,
            plugin?.voterWeightPk,
            plugin?.maxVoterWeightRecord
          )
        }

        const transaction = new Transaction()
        transaction.add(...instructions)
        transaction.recentBlockhash = recentBlockhash
        transaction.setSigners(
          // fee payed by the wallet owner
          wallet.publicKey!
        )
        transactions.push(transaction)
      }
      const signedTXs = await wallet.signAllTransactions(transactions)
      await Promise.all(
        signedTXs.map((transaction) =>
          sendSignedTransaction({ signedTransaction: transaction, connection })
        )
      )
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.rpcEndpoint),
      })
      toggleMultiVoteMode()
      notify({
        message: 'Successfully voted on all proposals',
        type: 'success',
      })
    } catch (e) {
      notify({ type: 'erorr', message: `Something went wrong, ${e}` })
    }
    setIsMultiVoting(false)
  }

  /** side effect: whenever filter changes, paginate to zero  */
  useEffect(() => {
    setPaginatedProposals(paginateProposals(0))
    pagination?.current?.setPage(0)
  }, [paginateProposals, filteredProposals])

  return (
    <>
      <div
        className={`bottom-0 bg-bkg-3 flex flex-col justify-center fixed h-24 px-4 md:px-6 lg:px-8 transform transition-all duration-300 ease-in-out w-full left-1/2 -translate-x-1/2 z-10 ${
          multiVoteMode ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="mb-2">
              {`${selectedProposals.length} Proposal${
                selectedProposals.length === 1 ? '' : 's'
              } Selected`}
            </h4>
            <Checkbox
              checked={allVotingProposalsSelected}
              label={allVotingProposalsSelected ? 'Deselect All' : 'Select All'}
              onChange={() => toggleSelectAll()}
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button
              className="whitespace-nowrap"
              disabled={cantMultiVote}
              tooltipMessage={
                !hasCommunityVoteWeight && !hasCouncilVoteWeight
                  ? "You don't have voting power"
                  : ''
              }
              onClick={() => voteOnSelected(YesNoVote.Yes)}
              isLoading={isMultiVoting}
            >
              Vote Yes
            </Button>
            <Button
              className="whitespace-nowrap"
              disabled={cantMultiVote}
              tooltipMessage={
                !hasCommunityVoteWeight && !hasCouncilVoteWeight
                  ? "You don't have voting power"
                  : ''
              }
              onClick={() => voteOnSelected(YesNoVote.No)}
              isLoading={isMultiVoting}
            >
              Vote No
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {realmQuery.isLoading ? (
          <>
            <div className={`col-span-12 md:col-span-7 lg:col-span-8`}>
              <div className="animate-pulse bg-bkg-3 h-full rounded-lg w-full" />
            </div>
            <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
              <div className="animate-pulse bg-bkg-3 h-64 rounded-lg w-full" />
              <div className="animate-pulse bg-bkg-3 h-64 rounded-lg w-full" />
              <div className="animate-pulse bg-bkg-3 h-64 rounded-lg w-full" />
            </div>
          </>
        ) : realmQuery.data?.result !== undefined ? (
          <>
            <div
              className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last rounded-lg`}
            >
              <RealmHeader />
              <div className="p-4 md:p-6 ">
                <div>
                  {realmInfo?.bannerImage ? (
                    <>
                      <img className="mb-10" src={realmInfo?.bannerImage}></img>
                      {/* temp. setup for Ukraine.SOL */}
                      {realmInfo.sharedWalletId && (
                        <div>
                          <div className="mb-10">
                            <DepositLabel
                              abbreviatedAddress={false}
                              header="Wallet Address"
                              transferAddress={realmInfo.sharedWalletId}
                            ></DepositLabel>
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                <Tabs
                  activeTab={activeTab}
                  onChange={(t) => setActiveTab(t)}
                  tabs={['Proposals', 'About']}
                />
                {activeTab === 'Proposals' && (
                  <>
                    <div className="pb-3">
                      <div className="flex items-center pb-4 space-x-3">
                        <Input
                          className="pl-8 w-full"
                          type="text"
                          placeholder="Search Proposals"
                          value={proposalSearch}
                          noMaxWidth
                          onChange={(e) => {
                            setProposalSearch(e.target.value)
                          }}
                          prefix={<SearchIcon className="h-5 w-5 text-fgd-3" />}
                        />
                        <ProposalFilter
                          disabled={multiVoteMode}
                          filters={filters}
                          onChange={setFilters}
                        />
                        <ProposalSorting
                          sorting={sorting}
                          disabled={multiVoteMode}
                          onChange={handleSetSorting}
                        ></ProposalSorting>
                      </div>
                      <div
                        className={`flex lg:flex-row items-center justify-between lg:space-x-3 w-full flex-col-reverse`}
                      >
                        <h4 className="font-normal mb-0 text-fgd-2 whitespace-nowrap">
                          {`${filteredProposals.length} Proposal${
                            filteredProposals.length === 1 ? '' : 's'
                          }`}
                        </h4>
                        <div
                          className={`flex items-center lg:justify-end lg:pb-0 lg:space-x-3 w-full justify-between pb-3`}
                        >
                          <div className="flex items-center">
                            <p className="mb-0 mr-1 text-fgd-3">Batch voting</p>
                            <Switch
                              checked={multiVoteMode}
                              onChange={() => {
                                toggleMultiVoteMode()
                              }}
                            />
                          </div>
                          <NewProposalBtn />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {filteredProposals.length > 0 ? (
                        <>
                          {paginatedProposals.map(([k, v]) =>
                            multiVoteMode ? (
                              <ProposalSelectCard
                                key={k}
                                proposalPk={new PublicKey(k)}
                                proposal={v.account}
                                selectedProposals={selectedProposals}
                                setSelectedProposals={setSelectedProposals}
                              />
                            ) : (
                              <ProposalCard
                                key={k}
                                proposalPk={new PublicKey(k)}
                                proposal={v.account}
                              />
                            )
                          )}
                          <PaginationComponent
                            ref={pagination}
                            totalPages={Math.ceil(
                              filteredProposals.length / proposalsPerPage
                            )}
                            onPageChange={onProposalPageChange}
                          ></PaginationComponent>
                        </>
                      ) : (
                        <div className="bg-bkg-3 px-4 md:px-6 py-4 rounded-lg text-center text-fgd-3">
                          No proposals found
                        </div>
                      )}
                    </div>
                  </>
                )}
                {activeTab === 'About' && <AboutRealm />}
              </div>
            </div>
            <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
              <TokenBalanceCardWrapper />
              {!process?.env?.DISABLE_NFTS && <NFTSCompactWrapper />}
              <AccountsCompactWrapper />
              <AssetsCompactWrapper />
            </div>
          </>
        ) : (
          <>Realm not found</>
        )}
      </div>
    </>
  )
}

export default REALM

export interface SelectedProposal {
  proposal: Proposal
  proposalPk: PublicKey
}
