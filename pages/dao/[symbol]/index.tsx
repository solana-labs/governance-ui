import useRealm from 'hooks/useRealm'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ProposalFilter from 'components/ProposalFilter'
import {
  Governance,
  ProgramAccount,
  Proposal,
  ProposalState,
} from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import NewProposalBtn from './proposal/components/NewProposalBtn'
import { PublicKey } from '@solana/web3.js'
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

const compareProposals = (
  p1: Proposal,
  p2: Proposal,
  governances: {
    [governance: string]: ProgramAccount<Governance>
  }
) => {
  const p1Rank = p1.getStateSortRank()
  const p2Rank = p2.getStateSortRank()

  if (p1Rank > p2Rank) {
    return 1
  } else if (p1Rank < p2Rank) {
    return -1
  }

  if (p1.state === ProposalState.Voting && p2.state === ProposalState.Voting) {
    const p1VotingRank = getVotingStateRank(p1, governances)
    const p2VotingRank = getVotingStateRank(p2, governances)

    if (p1VotingRank > p2VotingRank) {
      return 1
    } else if (p1VotingRank < p2VotingRank) {
      return -1
    }

    // Show the proposals in voting state expiring earlier at the top
    return p2.getStateTimestamp() - p1.getStateTimestamp()
  }

  return p1.getStateTimestamp() - p2.getStateTimestamp()
}

/// Compares proposals in voting state to distinguish between Voting and Finalizing states
function getVotingStateRank(
  proposal: Proposal,
  governances: {
    [governance: string]: ProgramAccount<Governance>
  }
) {
  // Show proposals in Voting state before proposals in Finalizing state
  const governance = governances[proposal.governance.toBase58()].account
  return proposal.hasVoteTimeEnded(governance) ? 0 : 1
}

const REALM = () => {
  const pagination = useRef<{ setPage: (val) => void }>(null)
  const { realm, realmInfo, proposals, governances } = useRealm()
  const proposalsPerPage = 20
  const [filters, setFilters] = useState<ProposalState[]>([])
  const [displayedProposals, setDisplayedProposals] = useState(
    Object.entries(proposals)
  )
  const [paginatedProposals, setPaginatedProposals] = useState<
    [string, ProgramAccount<Proposal>][]
  >([])
  const [proposalSearch, setProposalSearch] = useState('')
  const [filteredProposals, setFilteredProposals] = useState(displayedProposals)
  const [activeTab, setActiveTab] = useState('Proposals')
  const [multiVoteMode, setMultiVoteMode] = useState(false)
  const [selectedProposals, setSelectedProposals] = useState<any[]>([])
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal
  )
  const connected = useWalletStore((s) => s.connected)

  const allProposals = Object.entries(proposals).sort((a, b) =>
    compareProposals(b[1].account, a[1].account, governances)
  )
  useEffect(() => {
    setPaginatedProposals(paginateProposals(0))
    pagination?.current?.setPage(0)
  }, [JSON.stringify(filteredProposals)])

  useEffect(() => {
    let proposals =
      filters.length > 0
        ? allProposals.filter(([, v]) => !filters.includes(v.account.state))
        : allProposals
    if (proposalSearch) {
      proposals = proposals.filter(([, v]) =>
        v.account.name
          .toLowerCase()
          .includes(proposalSearch.toLocaleLowerCase())
      )
    }
    setFilteredProposals(proposals)
  }, [filters, proposalSearch])

  useEffect(() => {
    const proposals =
      filters.length > 0
        ? allProposals.filter(([, v]) => !filters.includes(v.account.state))
        : allProposals
    setDisplayedProposals(proposals)
    setFilteredProposals(proposals)
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

  const votingProposals = useMemo(
    () =>
      allProposals.filter(
        ([k, v]) =>
          v.account.state === ProposalState.Voting &&
          !ownVoteRecordsByProposal[k]
      ),
    [allProposals]
  )

  useEffect(() => {
    if (multiVoteMode) {
      setFilteredProposals(votingProposals)
    } else {
      const proposals =
        filters.length > 0
          ? allProposals.filter(([, v]) => !filters.includes(v.account.state))
          : allProposals
      setFilteredProposals(proposals)
    }
  }, [multiVoteMode])

  const allVotingProposalsSelected =
    selectedProposals.length === votingProposals.length

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
              disabled={selectedProposals.length === 0}
            >
              Vote Yes
            </Button>
            <Button
              className="whitespace-nowrap"
              disabled={selectedProposals.length === 0}
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
                      <img
                        className="mb-10 h-80"
                        src={realmInfo?.bannerImage}
                      ></img>
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
                          setFilters={setFilters}
                        />
                      </div>
                      <div className="flex flex-col-reverse lg:flex-row items-center justify-between lg:space-x-3 w-full">
                        <h4 className="font-normal mb-0 text-fgd-2 lg:whitespace-nowrap">{`${
                          filteredProposals.length
                        } Proposal${
                          filteredProposals.length === 1 ? '' : 's'
                        }`}</h4>
                        <div className="flex items-center justify-between lg:justify-end pb-3 lg:pb-0 lg:space-x-3 w-full">
                          {realm.account.votingProposalCount > 1 &&
                          connected ? (
                            <div className="flex items-center">
                              <p className="mb-0 mr-1 text-fgd-3">
                                Multi-vote Mode
                              </p>
                              <Switch
                                checked={multiVoteMode}
                                onChange={() => {
                                  toggleMultiVoteMode()
                                }}
                              />
                            </div>
                          ) : null}
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
              <NFTSCompactWrapper />
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
