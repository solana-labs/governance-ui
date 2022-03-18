import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import React, { useEffect, useState } from 'react'
import ProposalFilter from 'components/ProposalFilter'
import {
  Governance,
  ProgramAccount,
  Proposal,
  ProposalState,
} from '@solana/spl-governance'
import NewProposalBtn from './proposal/components/NewProposalBtn'
import { PublicKey } from '@solana/web3.js'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import ApproveAllBtn from './proposal/components/ApproveAllBtn'
import dynamic from 'next/dynamic'
import PaginationComponent from '@components/Pagination'
import Tabs from '@components/Tabs'
import AboutRealm from '@components/AboutRealm'
const AccountsCompactWrapper = dynamic(
  () => import('@components/TreasuryAccount/AccountsCompactWrapper')
)
const MembersCompactWrapper = dynamic(
  () => import('@components/Members/MembersCompactWrapper')
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
  const {
    realm,
    realmInfo,
    proposals,
    realmTokenAccount,
    ownTokenRecord,
    governances,
  } = useRealm()
  const proposalsPerPage = 20
  const [filters, setFilters] = useState<ProposalState[]>([])
  const [displayedProposals, setDisplayedProposals] = useState(
    Object.entries(proposals)
  )
  const [paginatedProposals, setPaginatedProposals] = useState<
    [string, ProgramAccount<Proposal>][]
  >([])
  const [filteredProposals, setFilteredProposals] = useState(displayedProposals)
  const [activeTab, setActiveTab] = useState('Proposals')
  const wallet = useWalletStore((s) => s.current)

  const allProposals = Object.entries(proposals).sort((a, b) =>
    compareProposals(b[1].account, a[1].account, governances)
  )
  useEffect(() => {
    setPaginatedProposals(paginateProposals(0))
  }, [filteredProposals])
  useEffect(() => {
    if (filters.length > 0) {
      const proposals = allProposals.filter(
        ([, v]) => !filters.includes(v.account.state)
      )
      setFilteredProposals(proposals)
    } else {
      setFilteredProposals(allProposals)
    }
  }, [filters])

  useEffect(() => {
    const proposals =
      filters.length > 0
        ? allProposals.filter(([, v]) => !filters.includes(v.account.state))
        : allProposals
    setDisplayedProposals(proposals)
    setFilteredProposals(proposals)
  }, [proposals])

  // DEBUG print remove
  console.log(
    'governance page tokenAccount',
    realmTokenAccount && realmTokenAccount.publicKey.toBase58()
  )

  console.log(
    'governance page wallet',
    wallet?.connected && wallet?.publicKey?.toBase58()
  )

  console.log(
    'governance page tokenRecord',
    wallet?.connected && ownTokenRecord
  )
  const onProposalPageChange = (page) => {
    setPaginatedProposals(paginateProposals(page))
  }
  const paginateProposals = (page) => {
    return filteredProposals.slice(
      page * proposalsPerPage,
      (page + 1) * proposalsPerPage
    )
  }

  return (
    <>
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
                      {realmInfo.realmId.equals(
                        new PublicKey(
                          '5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d'
                        )
                      ) ? (
                        <div>
                          <div className="mb-10">
                            <DepositLabel
                              abbreviatedAddress={false}
                              header="Wallet Address"
                              transferAddress={
                                new PublicKey(
                                  '66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV'
                                )
                              }
                            ></DepositLabel>
                          </div>
                        </div>
                      ) : null}
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
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-normal mb-0 text-fgd-2">{`${filteredProposals.length} Proposals`}</h4>
                      <div className="flex items-center space-x-4">
                        <ApproveAllBtn />
                        <NewProposalBtn />
                        <ProposalFilter
                          filters={filters}
                          setFilters={setFilters}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {filteredProposals.length > 0 ? (
                        <>
                          {paginatedProposals.map(([k, v]) => (
                            <ProposalCard
                              key={k}
                              proposalPk={new PublicKey(k)}
                              proposal={v.account}
                            />
                          ))}
                          <PaginationComponent
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
              {!realm?.account.config.useCommunityVoterWeightAddin && (
                <MembersCompactWrapper />
              )}
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
