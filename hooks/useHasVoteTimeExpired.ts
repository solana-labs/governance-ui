import { Governance, Proposal } from '../models/accounts'
import { ParsedAccount } from '../models/core/accounts'
import { useIsBeyondTimestamp } from './useIsBeyondTimestamp'

export const useHasVoteTimeExpired = (
  governance: ParsedAccount<Governance> | undefined,
  proposal: ParsedAccount<Proposal>
) => {
  return useIsBeyondTimestamp(
    proposal
      ? proposal.info.isVoteFinalized()
        ? 0 // If vote is finalized then set the timestamp to 0 to make it expired
        : proposal.info.votingAt && governance
        ? proposal.info.votingAt.toNumber() +
          governance.info.config.maxVotingTime
        : undefined
      : undefined
  )
}
