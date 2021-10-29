import { GovernanceAccountType } from '@models/accounts'
import { GovernedTokenAccount } from '@utils/tokens'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import useRealm from './useRealm'
export default function useInstructions() {
  const { governances, tokenMints, realmTokenAccounts } = useRealm()
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

  const canUseProgramUpgradeInstruction =
    realm &&
    getGovernancesByAccountType(
      GovernanceAccountType.ProgramGovernance
    ).some((g) => ownVoterWeight.canCreateProposal(g.info.config))

  const availableInstructions = [
    {
      id: Instructions.Transfer,
      name: 'Transfer Tokens',
      isVisible: canUseTransferInstruction,
    },
    {
      id: Instructions.ProgramUpgrade,
      name: 'Program Upgrade',
      isVisible: canUseProgramUpgradeInstruction,
    },
  ]
  const getAvailableInstructions = () => {
    return availableInstructions.filter((x) => x.isVisible)
  }
  function prepareGovernances() {
    const tokenGovernances = getGovernancesByAccountType(
      GovernanceAccountType.TokenGovernance
    )
    const governedTokenAccounts: GovernedTokenAccount[] = []
    for (const i of tokenGovernances) {
      const realmTokenAccount = realmTokenAccounts.find(
        (x) => x.publicKey.toBase58() === i.info.governedAccount.toBase58()
      )
      const mint = tokenMints.find(
        (x) =>
          realmTokenAccount?.account.mint.toBase58() === x.publicKey.toBase58()
      )
      const obj = {
        governance: i,
        token: realmTokenAccount,
        mint,
      }
      governedTokenAccounts.push(obj)
    }
    return governedTokenAccounts
  }
  const governedTokenAccounts = prepareGovernances()
  return {
    governancesArray,
    getGovernancesByAccountType,
    availableInstructions,
    getAvailableInstructions,
    governedTokenAccounts,
  }
}
