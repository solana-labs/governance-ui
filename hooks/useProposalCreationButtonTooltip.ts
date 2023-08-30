import { Governance, ProgramAccount } from '@solana/spl-governance'
import useRealm from './useRealm'
import useWalletOnePointOh from './useWalletOnePointOh'
import { useLegacyVoterWeight } from './queries/governancePower'

const useProposalCreationButtonTooltip = (
  governances?: ProgramAccount<Governance>[]
) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { result: ownVoterWeight } = useLegacyVoterWeight()
  const {
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const tooltipContent = !governances
    ? 'Loading...'
    : !connected
    ? 'Connect your wallet to create new proposal'
    : !governances.some((g) =>
        ownVoterWeight?.canCreateProposal(g.account.config)
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
