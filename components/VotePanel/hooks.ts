import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from '@hooks/queries/addresses/tokenOwner'
import { useAddressQuery_SelectedProposalVoteRecord } from '@hooks/queries/addresses/voteRecord'
import { useVoteRecordByPubkeyQuery } from '@hooks/queries/voteRecord'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import useRealm from '@hooks/useRealm'
import {
  ProposalState,
  GoverningTokenRole,
  Proposal,
  Governance,
} from '@solana/spl-governance'
import dayjs from 'dayjs'
import useWalletStore from 'stores/useWalletStore'

export const useIsVoting = () => {
  const { governance, proposal } = useWalletStore((s) => s.selectedProposal)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)

  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired
  return isVoting
}

export const useIsInCoolOffTime = () => {
  const { governance, proposal } = useWalletStore((s) => s.selectedProposal)

  return isInCoolOffTime(proposal?.account, governance?.account)
}

export const isInCoolOffTime = (
  proposal: Proposal | undefined,
  governance: Governance | undefined
) => {
  const mainVotingEndedAt = proposal?.signingOffAt
    ?.addn(governance?.config.maxVotingTime || 0)
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
  const { tokenRole } = useWalletStore((s) => s.selectedProposal)

  const votingPop =
    tokenRole === GoverningTokenRole.Community ? 'community' : 'council'

  return votingPop
}

export const useVoterTokenRecord = () => {
  const { tokenRole } = useWalletStore((s) => s.selectedProposal)
  const { ownTokenRecord, ownCouncilTokenRecord } = useRealm()

  const voterTokenRecord =
    tokenRole === GoverningTokenRole.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord
  return voterTokenRecord
}

export const useProposalVoteRecordQuery = (quorum: 'electoral' | 'veto') => {
  const tokenRole = useWalletStore((s) => s.selectedProposal.tokenRole)
  const community = useAddressQuery_CommunityTokenOwner()
  const council = useAddressQuery_CouncilTokenOwner()

  const electoral =
    tokenRole === undefined
      ? undefined
      : tokenRole === GoverningTokenRole.Community
      ? community
      : council
  const veto =
    tokenRole === undefined
      ? undefined
      : tokenRole === GoverningTokenRole.Community
      ? council
      : community

  const selectedTokenRecord = quorum === 'electoral' ? electoral : veto

  const pda = useAddressQuery_SelectedProposalVoteRecord(
    selectedTokenRecord?.data
  )

  return useVoteRecordByPubkeyQuery(pda.data)
}
