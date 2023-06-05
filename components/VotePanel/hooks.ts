import { useRouteProposalQuery } from '@hooks/queries/proposal'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import useRoleOfGovToken from '@hooks/selectedRealm/useRoleOfToken'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import { useProposalGovernanceQuery } from '@hooks/useProposal'
import { ProposalState, Proposal, Governance } from '@solana/spl-governance'
import dayjs from 'dayjs'

export const useIsVoting = () => {
  const proposal = useRouteProposalQuery().data?.result
  const governance = useProposalGovernanceQuery().data?.result
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)

  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired
  return isVoting
}

export const useIsInCoolOffTime = () => {
  const proposal = useRouteProposalQuery().data?.result
  const governance = useProposalGovernanceQuery().data?.result

  return isInCoolOffTime(proposal?.account, governance?.account)
}

export const isInCoolOffTime = (
  proposal: Proposal | undefined,
  governance: Governance | undefined
) => {
  const mainVotingEndedAt = proposal?.signingOffAt
    ?.addn(governance?.config.baseVotingTime || 0)
    .toNumber()

  const votingCoolOffTime = governance?.config.votingCoolOffTime || 0
  const canFinalizeAt = mainVotingEndedAt
    ? mainVotingEndedAt + votingCoolOffTime
    : mainVotingEndedAt

  const endOfProposalAndCoolOffTime = canFinalizeAt
    ? dayjs(1000 * canFinalizeAt!)
    : undefined

  const isInCoolOffTime = endOfProposalAndCoolOffTime
    ? dayjs().isBefore(endOfProposalAndCoolOffTime) &&
      mainVotingEndedAt &&
      dayjs().isAfter(mainVotingEndedAt * 1000)
    : undefined

  return !!isInCoolOffTime && proposal!.state !== ProposalState.Defeated
}

export const useVotingPop = () => {
  const proposal = useRouteProposalQuery().data?.result
  const role = useRoleOfGovToken(proposal?.account.governingTokenMint)

  return role !== 'not found' ? role : undefined
}

export const useVoterTokenRecord = () => {
  const votingPop = useVotingPop()
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result

  const voterTokenRecord =
    votingPop === 'community' ? ownTokenRecord : ownCouncilTokenRecord
  return voterTokenRecord
}
