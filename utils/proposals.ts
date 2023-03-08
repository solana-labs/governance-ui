import { Filters } from '@components/ProposalFilter'
import { Sorting, SORTING_OPTIONS } from '@components/ProposalSorting'
import { hasInstructions } from '@components/ProposalStateBadge'
import { BN } from '@coral-xyz/anchor'
import {
  Governance,
  ProgramAccount,
  Proposal,
  ProposalState,
  Realm,
} from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { fmtTokenAmount } from './formatting'

export const compareProposals = (
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

export function getVotingStateRank(
  proposal: Proposal,
  governances: {
    [governance: string]: ProgramAccount<Governance>
  }
) {
  // Show proposals in Voting state before proposals in Finalizing state
  const governance = governances[proposal.governance.toBase58()].account
  return proposal.hasVoteTimeEnded(governance) ? 0 : 1
}

export const filterProposals = (
  proposals: [string, ProgramAccount<Proposal>][],
  filters: Filters,
  sorting: Sorting,
  realm: ProgramAccount<Realm> | undefined,
  governances: Record<string, ProgramAccount<Governance>>,
  councilMint: MintInfo | undefined,
  communityMint: MintInfo | undefined
) => {
  return proposals
    .sort(([, proposalA], [, proposalB]) => {
      if (sorting.completed_at === SORTING_OPTIONS.ASC) {
        return (
          proposalA.account.votingCompletedAt ||
          proposalA.account.signingOffAt ||
          proposalA.account.draftAt ||
          new BN(0)
        )
          .sub(
            proposalB.account.votingCompletedAt ||
              proposalB.account.signingOffAt ||
              proposalB.account.draftAt ||
              new BN(0)
          )
          .toNumber()
      }
      if (sorting.completed_at === SORTING_OPTIONS.DESC) {
        return (
          proposalB.account.votingCompletedAt ||
          proposalB.account.signingOffAt ||
          proposalB.account.draftAt ||
          new BN(0)
        )
          .sub(
            proposalA.account.votingCompletedAt ||
              proposalA.account.signingOffAt ||
              proposalA.account.draftAt ||
              new BN(0)
          )
          .toNumber()
      }
      if (sorting.signedOffAt === SORTING_OPTIONS.ASC) {
        return (
          proposalA.account.signingOffAt ||
          proposalA.account.draftAt ||
          new BN(0)
        )
          .sub(
            proposalB.account.signingOffAt ||
              proposalB.account.draftAt ||
              new BN(0)
          )
          .toNumber()
      }
      if (sorting.signedOffAt === SORTING_OPTIONS.DESC) {
        return (
          proposalB.account.signingOffAt ||
          proposalB.account.draftAt ||
          new BN(0)
        )
          .sub(
            proposalA.account.signingOffAt ||
              proposalA.account.draftAt ||
              new BN(0)
          )
          .toNumber()
      }
      return 0
    })
    .filter(([, proposal]) => {
      if (
        !filters.Cancelled &&
        proposal.account.state === ProposalState.Cancelled
      ) {
        return false
      }

      if (!filters.Completed) {
        if (proposal.account.state === ProposalState.Completed) {
          return false
        }

        if (
          proposal.account.state === ProposalState.Succeeded &&
          !hasInstructions(proposal.account)
        ) {
          return false
        }
      }

      if (!filters.Vetoed && proposal.account.state === ProposalState.Vetoed) {
        return false
      }

      if (
        !filters.Defeated &&
        proposal.account.state === ProposalState.Defeated
      ) {
        return false
      }

      if (!filters.Draft && proposal.account.state === ProposalState.Draft) {
        return false
      }

      if (!filters.Executable) {
        if (proposal.account.state === ProposalState.Executing) {
          return false
        }

        if (
          proposal.account.state === ProposalState.Succeeded &&
          hasInstructions(proposal.account)
        ) {
          return false
        }
      }

      if (
        !filters.ExecutingWithErrors &&
        proposal.account.state === ProposalState.ExecutingWithErrors
      ) {
        return false
      }

      if (
        !filters.SigningOff &&
        proposal.account.state === ProposalState.SigningOff
      ) {
        return false
      }

      if (
        !filters.Voting &&
        proposal.account.state === ProposalState.Voting &&
        !filters.withoutQuorum
      ) {
        return false
      }
      if (
        filters.withoutQuorum &&
        proposal.account.state === ProposalState.Voting
      ) {
        const proposalMint =
          proposal?.account.governingTokenMint.toBase58() ===
          realm?.account.communityMint.toBase58()
            ? communityMint
            : councilMint
        const isCommunityVote =
          proposal.account?.governingTokenMint.toBase58() ===
          realm?.account.communityMint.toBase58()
        const governance =
          governances[proposal.account.governance.toBase58()].account
        const voteThresholdPct = isCommunityVote
          ? governance.config.communityVoteThreshold.value
          : governance.config.councilVoteThreshold.value

        const minimumYesVotes =
          fmtTokenAmount(proposalMint!.supply, proposalMint!.decimals) *
          (voteThresholdPct! / 100)
        return (
          fmtTokenAmount(
            proposal.account.getYesVoteCount(),
            proposalMint!.decimals
          ) < minimumYesVotes && !proposal.account.hasVoteTimeEnded(governance)
        )
      }

      return true
    })
}
