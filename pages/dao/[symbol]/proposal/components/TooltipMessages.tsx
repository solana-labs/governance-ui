import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'

export const tooltipMessage = () => {
  const {
    canUseMintInstruction,
    canMintRealmCouncilToken,
    canUseProgramUpgradeInstruction,
    canUseTransferInstruction,
  } = useGovernanceAssets()

  const {
    toManyCouncilOutstandingProposalsForUse,
    toManyCommunityOutstandingProposalsForUser,
  } = useRealm()

  const connected = useWalletStore((s) => s.connected)

  const lackOfGovernancePowerMessage =
    "You don't have enough governance power to execute this action."

  const connectWalletMessage = 'Connect your wallet to execute this action.'

  const getTooManyOutstandingProposalsMessage = (type: string) => {
    return `You have too many ${type} outstanding proposals. You need to finalize them before executing this action.`
  }

  const validate = (customValidation: boolean | undefined) => {
    return !connected
      ? connectWalletMessage
      : !customValidation
      ? lackOfGovernancePowerMessage
      : toManyCommunityOutstandingProposalsForUser
      ? getTooManyOutstandingProposalsMessage('community')
      : toManyCouncilOutstandingProposalsForUse
      ? getTooManyOutstandingProposalsMessage('council')
      : ''
  }

  const treasuryPaymentTooltip = validate(canUseTransferInstruction)

  const addNewMemberTooltip =
    validate(canUseMintInstruction) && !canMintRealmCouncilToken()
      ? 'Your realm need mint governance for council token to add new member'
      : ''

  const programUpgradeTooltip = validate(canUseProgramUpgradeInstruction)
  const mintTokensTooltip = validate(canUseMintInstruction)
  const genericTooltip = validate(undefined)

  return {
    treasuryPaymentTooltip,
    addNewMemberTooltip,
    programUpgradeTooltip,
    mintTokensTooltip,
    genericTooltip,
  }
}
