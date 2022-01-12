import { Governance, Proposal } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { useIsBeyondTimestamp } from './useIsBeyondTimestamp'

export const useHasVoteTimeExpired = (
  governance: ProgramAccount<Governance> | undefined,
  proposal: ProgramAccount<Proposal>
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
