import useWalletStore from '../../../stores/useWalletStore'
import useRealm from '../../../hooks/useRealm'
import React, { useEffect, useState } from 'react'
import ProposalFilter from '../../../components/ProposalFilter'
import ProposalCard from '../../../components/ProposalCard'
import TokenBalanceCard from '../../../components/TokenBalanceCard'
import { Proposal, ProposalState } from '../../../models/accounts'
import NewProposalBtn from './proposal/components/NewProposalBtn'
import RealmHeader from '../../../components/RealmHeader'
import { PublicKey } from '@solana/web3.js'
import TreasuryAccountsCompactWrapper from '@components/TreasuryAccount/TreasuryAccountsCompactWrapper'

const compareProposals = (p1: Proposal, p2: Proposal) => {
  const p1Rank = p1.getStateSortRank()
  const p2Rank = p2.getStateSortRank()

  if (p1Rank > p2Rank) {
    return 1
  } else if (p1Rank < p2Rank) {
    return -1
  }

  const tsCompare = p1.getStateTimestamp() - p2.getStateTimestamp()

  // Show the proposals in voting state expiring earlier at the top
  return p1.state === ProposalState.Voting ? ~tsCompare : tsCompare
}

const REALM = () => {
  const { proposals, realmTokenAccount, ownTokenRecord } = useRealm()
  const [filters, setFilters] = useState<ProposalState[]>([])
  const [displayedProposals, setDisplayedProposals] = useState(
    Object.entries(proposals)
  )
  const [filteredProposals, setFilteredProposals] = useState(displayedProposals)
  const wallet = useWalletStore((s) => s.current)

  const allProposals = Object.entries(proposals).sort((a, b) =>
    compareProposals(b[1].info, a[1].info)
  )

  useEffect(() => {
    if (filters.length > 0) {
      const proposals = displayedProposals.filter(
        ([, v]) => !filters.includes(v.info.state)
      )
      setFilteredProposals(proposals)
    } else {
      setFilteredProposals(allProposals)
    }
  }, [filters])

  useEffect(() => {
    const proposals =
      filters.length > 0
        ? allProposals.filter(([, v]) => !filters.includes(v.info.state))
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

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg">
          <RealmHeader />
          <div className="flex items-center justify-between pb-3">
            <h4 className="text-fgd-2">{`${filteredProposals.length} proposals`}</h4>
            <div className="flex items-center">
              <div className="mr-4">
                <NewProposalBtn />
              </div>
              <ProposalFilter filters={filters} setFilters={setFilters} />
            </div>
          </div>
          <div className="space-y-3">
            {filteredProposals.length > 0 ? (
              filteredProposals.map(([k, v]) => (
                <ProposalCard
                  key={k}
                  proposalPk={new PublicKey(k)}
                  proposal={v.info}
                />
              ))
            ) : (
              <div className="bg-bkg-3 px-4 md:px-6 py-4 rounded-lg text-center text-fgd-3">
                No proposals found
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <TokenBalanceCard />
          <TreasuryAccountsCompactWrapper></TreasuryAccountsCompactWrapper>
        </div>
      </div>
    </>
  )
}

export default REALM
