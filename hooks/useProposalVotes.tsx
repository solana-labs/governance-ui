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
      yesVoteCount: 0,
      noVoteCount: 0,
    }

  const voteThresholdPct =
    (proposal.isVoteFinalized() && proposal.voteThresholdPercentage?.value) ||
    governance.config.voteThresholdPercentage.value

  const yesVotePct = calculatePct(proposal.yesVotesCount, mint.supply)
  const yesVoteProgress = (yesVotePct / voteThresholdPct) * 100

  const yesVoteCount = fmtTokenAmount(proposal.yesVotesCount, mint.decimals)
  const noVoteCount = fmtTokenAmount(proposal.noVotesCount, mint.decimals)

  const relativeYesVotes = (yesVoteCount / (yesVoteCount + noVoteCount)) * 100
  const relativeNoVotes = (noVoteCount / (yesVoteCount + noVoteCount)) * 100

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
