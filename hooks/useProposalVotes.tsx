import { Proposal } from '../models/accounts'
import { calculatePct, fmtTokenAmount } from '../utils/formatting'
import useRealm from './useRealm'

export default function useProposalVotes(proposal?: Proposal) {
  const { mint, governances } = useRealm()

  const governance = governances[proposal?.governance?.toBase58()]?.info

  // TODO: optimize using memo
  if (!proposal || !governance || !mint)
    return {
      voteThresholdPct: 100,
      yesVotePct: 0,
      yesVoteProgress: 0,
      yesVoteCount: 'N/A',
      noVoteCount: 'N/A',
    }

  const voteThresholdPct =
    (proposal.isVoteFinalized() && proposal.voteThresholdPercentage?.value) ||
    governance.config.voteThresholdPercentage.value

  const yesVotePct = calculatePct(proposal.yesVotesCount, mint.supply)
  const yesVoteProgress = (yesVotePct / voteThresholdPct) * 100

  const yesVoteCount = fmtTokenAmount(proposal.yesVotesCount, mint.decimals)
  const noVoteCount = fmtTokenAmount(proposal.noVotesCount, mint.decimals)

  return {
    voteThresholdPct,
    yesVotePct,
    yesVoteProgress,
    yesVoteCount,
    noVoteCount,
  }
}
