import { useRouter } from 'next/router'
import useWalletStore from '../../stores/useWalletStore'
import useRealm from '../../hooks/useRealm'
import React from 'react'
import ProposalFilter from '../../components/ProposalFilter'
import ProposalCard from '../../components/ProposalCard'
import TokenBalanceCard from '../../components/TokenBalanceCard'
import { Proposal, ProposalState } from '../../models/accounts'

// Compares proposals to display actionable proposals first
// 1) Proposal in Voting state - proposals with less voting time are displayed first
// 2) Proposals in pending, awaiting actions, states - (Draft, SigningOff, awaiting Execution)
// 3) Proposals in final states - no actions possible
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

const DAO = () => {
  const router = useRouter()
  const { symbol } = router.query

  const wallet = useWalletStore((s) => s.current)
  const { mint, proposals, realmTokenAccount, ownTokenRecord } = useRealm(
    symbol as string
  )

  // DEBUG print remove
  console.log(
    'governance page tokenAccount',
    realmTokenAccount && realmTokenAccount.publicKey.toBase58()
  )

  console.log(
    'governance page wallet',
    wallet?.connected && wallet.publicKey.toBase58()
  )

  console.log(
    'governance page tokenRecord',
    wallet?.connected && ownTokenRecord
  )

  const displayedProposal = Object.entries(proposals).sort((a, b) =>
    compareProposals(b[1].info, a[1].info)
  )

  return (
    <>
      <div className="grid grid-cols-12 gap-4 pb-10 pt-16">
        <div className="col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2>{`${displayedProposal.length} proposals`}</h2>
            <ProposalFilter />
          </div>
          {displayedProposal.map(([k, v]) => (
            <ProposalCard key={k} id={k} mint={mint} proposal={v.info} />
          ))}
        </div>
        <div className="col-span-4">
          <TokenBalanceCard />
        </div>
      </div>
    </>
  )
}

export default DAO
