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
    const governancesFiltred = governancesArray.filter(
      (gov) => gov.info?.accountType === type
    )
    return governancesFiltred
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
      name: 'Token Transfer',
      isVisbile: canUseTransferInstruction,
    },
  ]
  const getAvailableInstructions = () => {
    return availableInstructions.filter((x) => x.isVisbile)
  }
  return {
    governancesArray,
    getGovernancesByAccountType,
    availableInstructions,
    getAvailableInstructions,
  }
}
