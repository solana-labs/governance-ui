import { Governance, Proposal } from '../models/accounts'
import { ParsedAccount } from '../models/core/accounts'
import { useIsBeyondTimestamp } from './useIsBeyondTimestamp'

export const useHasVoteTimeExpired = (
  governance: ParsedAccount<Governance> | undefined,
  proposal: ParsedAccount<Proposal>
) => {
  return useIsBeyondTimestamp(
    proposal
      ? proposal.account.isVoteFinalized()
        ? 0 // If vote is finalized then set the timestamp to 0 to make it expired
        : proposal.account.votingAt && governance
        ? proposal.account.votingAt.toNumber() +
          governance.account.config.maxVotingTime
        : undefined
      : undefined
  )
}
