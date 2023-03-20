import useRealm from 'hooks/useRealm'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ProposalFilter, {
  InitialFilters,
  Filters,
} from 'components/ProposalFilter'
import {
  ProgramAccount,
  Proposal,
  ProposalState,
  Vote,
  withCastVote,
  YesNoVote,
} from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
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
import { NftVoterClient } from '@solana/governance-program-library'
import { notify } from '@utils/notifications'
import { sendSignedTransaction } from '@utils/send'
import { compareProposals, filterProposals } from '@utils/proposals'
import { REALM_ID as PYTH_REALM_ID } from 'pyth-staking-api'
import ProposalSorting, {
  InitialSorting,
  PROPOSAL_SORTING_LOCAL_STORAGE_KEY,
  Sorting,
} from '@components/ProposalSorting'

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
  const {
    realm,
    realmInfo,
    mint,
    councilMint,
    proposals,
    governances,
    tokenRecords,
    ownVoterWeight,
    ownTokenRecord,
    councilTokenOwnerRecords,
    ownCouncilTokenRecord,
  } = useRealm()
  const proposalsPerPage = 20
  const [filters, setFilters] = useState<Filters>(InitialFilters)
  const [sorting, setSorting] = useState<Sorting>(InitialSorting)
  const [displayedProposals, setDisplayedProposals] = useState(
    Object.entries(proposals)
  )
  const [paginatedProposals, setPaginatedProposals] = useState<
    [string, ProgramAccount<Proposal>][]
  >([])
  const [isMultiVoting, setIsMultiVoting] = useState(false)
  const [proposalSearch, setProposalSearch] = useState('')
  const [filteredProposals, setFilteredProposals] = useState(displayedProposals)
  const [activeTab, setActiveTab] = useState('Proposals')
  const [multiVoteMode, setMultiVoteMode] = useState(false)
  const [selectedProposals, setSelectedProposals] = useState<
    SelectedProposal[]
  >([])
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal
  )

  const councilDelegateVoteRecordsByProposal = useWalletStore(
    (s) => s.councilDelegateVoteRecordsByProposal
  )

  const communityDelegateVoteRecordsByProposal = useWalletStore(
    (s) => s.communityDelegateVoteRecordsByProposal
  )
  const selectedCouncilDelegate = useWalletStore(
    (s) => s.selectedCouncilDelegate
  )
  const selectedCommunityDelegate = useWalletStore(
    (s) => s.selectedCommunityDelegate
  )

  const getCurrentVoteRecKeyVal = () => {
    if (selectedCommunityDelegate) {
      return communityDelegateVoteRecordsByProposal
    }
    if (selectedCouncilDelegate) {
      return councilDelegateVoteRecordsByProposal
    }
    return ownVoteRecordsByProposal
  }

  const refetchProposals = useWalletStore((s) => s.actions.refetchProposals)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)

  const allProposals = Object.entries(proposals).sort((a, b) =>
    compareProposals(b[1].account, a[1].account, governances)
  )
  useEffect(() => {
    setPaginatedProposals(paginateProposals(0))
    pagination?.current?.setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(filteredProposals)])

  useEffect(() => {
    let proposals = filterProposals(
      allProposals,
      filters,
      sorting,
      realm,
      governances,
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
    setFilteredProposals(proposals)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [filters, proposalSearch, sorting])

  useEffect(() => {
    const proposals = filterProposals(
      allProposals,
      filters,
      sorting,
      realm,
      governances,
      councilMint,
      mint
    )
    setDisplayedProposals(proposals)
    setFilteredProposals(proposals)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(proposals)])

  const onProposalPageChange = (page) => {
    setPaginatedProposals(paginateProposals(page))
  }
  const paginateProposals = (page) => {
    return filteredProposals.slice(
      page * proposalsPerPage,
      (page + 1) * proposalsPerPage
    )
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
      allProposals.filter(([k, v]) => {
        const governance = governances[v.account.governance.toBase58()]?.account
        return (
          v.account.state === ProposalState.Voting &&
          !getCurrentVoteRecKeyVal()[k] &&
          !v.account.hasVoteTimeEnded(governance)
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    [allProposals]
  )

  useEffect(() => {
    setSelectedProposals([])
    if (multiVoteMode) {
      setFilteredProposals(votingProposals)
    } else {
      const proposals = filterProposals(
        allProposals,
        filters,
        sorting,
        realm,
        governances,
        councilMint,
        mint
      )
      setFilteredProposals(proposals)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [multiVoteMode])

  useEffect(() => {
    const initialSort = localStorage.getItem(PROPOSAL_SORTING_LOCAL_STORAGE_KEY)
    if (initialSort) {
      const initialSortObj = JSON.parse(initialSort)
      setSorting(initialSortObj)
    }
  }, [])

  const allVotingProposalsSelected =
    selectedProposals.length === votingProposals.length
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
        votingProposals.map(([k, v]) => ({
          proposal: v.account,
          proposalPk: new PublicKey(k),
        }))
      )
    }
  }

  const voteOnSelected = async (vote: YesNoVote) => {
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
        const ownTokenRecord =
          selectedProposal.proposal.governingTokenMint.toBase58() ===
          realm.account.communityMint.toBase58()
            ? tokenRecords[
                selectedCommunityDelegate
                  ? selectedCommunityDelegate
                  : wallet.publicKey!.toBase58()
              ]
            : councilTokenOwnerRecords[
                selectedCouncilDelegate
                  ? selectedCouncilDelegate
                  : wallet.publicKey!.toBase58()
              ]

        const instructions: TransactionInstruction[] = []

        //will run only if plugin is connected with realm
        const plugin = await client?.withCastPluginVote(
          instructions,
          {
            account: selectedProposal.proposal,
            pubkey: selectedProposal.proposalPk,
            owner: realm.pubkey,
          },
          ownTokenRecord
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
            ownTokenRecord.pubkey,
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
      await refetchProposals()
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

  //Todo: move to own components with refactor to dao folder structure
  const isPyth = realmInfo?.realmId.toBase58() === PYTH_REALM_ID.toBase58()

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
        {realm ? (
          <>
            <div
              className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last rounded-lg`}
            >
              {realm && <RealmHeader />}
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
              {!isPyth && !process?.env?.DISABLE_NFTS && <NFTSCompactWrapper />}
              <AccountsCompactWrapper />
              <AssetsCompactWrapper />
            </div>
          </>
        ) : (
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
