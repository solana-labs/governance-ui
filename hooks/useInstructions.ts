import { GovernanceAccountType } from '@models/accounts'
import { BN } from '@project-serum/anchor'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import useRealm from './useRealm'

export default function useInstructions() {
  const { governances } = useRealm()
  const governancesArray = Object.keys(governances).map(
    (key) => governances[key]
  )
  const { ownTokenRecord, realm } = useRealm()

  const getGovernancesByAccountType = (type: GovernanceAccountType) => {
    const governancesFiltered = governancesArray.filter(
      (gov) => gov.info?.accountType === type
    )
    return governancesFiltered
  }
  const canUseTransferInstruction = getGovernancesByAccountType(
    GovernanceAccountType.TokenGovernance
  ).filter(
    (x) =>
      ownTokenRecord &&
      realm &&
      ownTokenRecord.info.governingTokenDepositAmount.cmp(
        new BN(x.info.config.minCommunityTokensToCreateProposal)
      ) >= 0
  )
  const availableInstructions = [
    {
      id: Instructions.Transfer,
      name: 'Transfer Tokens',
      isVisible: canUseTransferInstruction,
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
