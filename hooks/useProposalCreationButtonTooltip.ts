import { Governance, ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'

const useProposalCreationButtonTooltip = (
  governances?: ProgramAccount<Governance>[]
) => {
  const connected = useWalletStore((s) => s.connected)
  const {
    ownVoterWeight,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const tooltipContent = !governances
    ? 'Loading...'
    : !connected
    ? 'Connect your wallet to create new proposal'
    : !governances.some((g) =>
        ownVoterWeight.canCreateProposal(g.account.config)
      )
    ? "You don't have enough governance power to create a new proposal"
    : toManyCommunityOutstandingProposalsForUser
    ? 'Too many community outstanding proposals. You need to finalize them before creating a new one.'
    : toManyCouncilOutstandingProposalsForUse
    ? 'Too many council outstanding proposals. You need to finalize them before creating a new one.'
    : undefined
  return tooltipContent
}

export default useProposalCreationButtonTooltip
