import { Proposal } from '../models/accounts'
import { calculatePct, fmtTokenAmount } from '../utils/formatting'
import useRealm from './useRealm'

export default function useProposalVotes(proposal?: Proposal) {
  const { realm, mint, councilMint, governances } = useRealm()

  const governance = governances[proposal?.governance?.toBase58()]?.info

  const proposalMint =
    proposal?.governingTokenMint.toBase58() ===
    realm?.info.communityMint.toBase58()
      ? mint
      : councilMint

  console.log('Proposal vote data', { councilMint })

  // TODO: optimize using memo
  if (!proposal || !governance || !proposalMint)
    return {
      voteThresholdPct: 100,
      yesVotePct: 0,
      yesVoteProgress: 0,
      yesVoteCount: 0,
      noVoteCount: 0,
    }

  const voteThresholdPct =
    (proposal.isVoteFinalized() && proposal.voteThresholdPercentage?.value) ||
    governance.config.voteThresholdPercentage.value

  const yesVotePct = calculatePct(proposal.yesVotesCount, proposalMint.supply)
  const yesVoteProgress = (yesVotePct / voteThresholdPct) * 100

  const yesVoteCount = fmtTokenAmount(
    proposal.yesVotesCount,
    proposalMint.decimals
  )
  const noVoteCount = fmtTokenAmount(
    proposal.noVotesCount,
    proposalMint.decimals
  )

  const totalVoteCount = yesVoteCount + noVoteCount

  const getRelativeVoteCount = (voteCount: number) =>
    totalVoteCount === 0 ? 0 : (voteCount / totalVoteCount) * 100

  const relativeYesVotes = getRelativeVoteCount(yesVoteCount)
  const relativeNoVotes = getRelativeVoteCount(noVoteCount)

  return {
    voteThresholdPct,
    yesVotePct,
    yesVoteProgress,
    yesVoteCount,
    noVoteCount,
    relativeYesVotes,
    relativeNoVotes,
  }
}
