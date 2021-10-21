import { GovernanceAccountType } from '@models/accounts'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import useRealm from './useRealm'

export default function useInstructions() {
  const { governances } = useRealm()
  const governancesArray = Object.keys(governances).map(
    (key) => governances[key]
  )
  const { ownVoterWeight, realm } = useRealm()

  const getGovernancesByAccountType = (type: GovernanceAccountType) => {
    const governancesFiltered = governancesArray.filter(
      (gov) => gov.info?.accountType === type
    )
    return governancesFiltered
  }

  // TODO: Check governedAccounts from all governances plus search for token accounts owned by governances
  const canUseTransferInstruction =
    realm &&
    getGovernancesByAccountType(
      GovernanceAccountType.TokenGovernance
    ).some((g) => ownVoterWeight.canCreateProposal(g.info.config))

  const availableInstructions = [
    {
      id: Instructions.Transfer,
      name: 'Transfer Tokens',
      isVisible: true,
    },
  ]
  const getAvailableInstructions = () => {
    return availableInstructions.filter((x) => x.isVisible)
  }
  return {
    governancesArray,
    getGovernancesByAccountType,
    availableInstructions,
    getAvailableInstructions,
  }
}
