import { GovernanceAccountType } from '@models/accounts'
import { MintInfo } from '@solana/spl-token'
import {
  getMultipleAccountInfoChunked,
  GovernedMintInfoAccount,
  GovernedTokenAccount,
  parseMintAccountData,
} from '@utils/tokens'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'
export default function useGovernanceAssets() {
  const { governances, tokenMints, realmTokenAccounts } = useRealm()
  const connection = useWalletStore((s) => s.connection.current)
  const { ownVoterWeight, realm } = useRealm()

  const governancesArray = Object.keys(governances).map(
    (key) => governances[key]
  )
  const getGovernancesByAccountType = (type: GovernanceAccountType) => {
    const governancesFiltered = governancesArray.filter(
      (gov) => gov.info?.accountType === type
    )
    return governancesFiltered
  }
  function canUseGovernanceForInstruction(type: GovernanceAccountType) {
    return (
      realm &&
      getGovernancesByAccountType(type).some((g) =>
        ownVoterWeight.canCreateProposal(g.info.config)
      )
    )
  }
  // TODO: Check governedAccounts from all governances plus search for token accounts owned by governances
  const canUseTransferInstruction = canUseGovernanceForInstruction(
    GovernanceAccountType.TokenGovernance
  )

  const canUseProgramUpgradeInstruction = canUseGovernanceForInstruction(
    GovernanceAccountType.ProgramGovernance
  )

  const canUseMintInstruction = canUseGovernanceForInstruction(
    GovernanceAccountType.MintGovernance
  )

  const canUseAnyInstruction =
    realm &&
    governancesArray.some((g) =>
      ownVoterWeight.canCreateProposal(g.info.config)
    )

  const availableInstructions = [
    {
      id: Instructions.Transfer,
      name: 'Transfer Tokens',
      isVisible: canUseTransferInstruction,
    },
    {
      id: Instructions.ProgramUpgrade,
      name: 'Upgrade Program',
      isVisible: canUseProgramUpgradeInstruction,
    },
    {
      id: Instructions.Mint,
      name: 'Mint Tokens',
      isVisible: canUseMintInstruction,
    },
    {
      id: Instructions.Base64,
      name: 'Execute Custom Instruction',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.None,
      name: 'None',
      isVisible:
        realm &&
        Object.values(governances).some((g) =>
          ownVoterWeight.canCreateProposal(g.info.config)
        ),
    },
  ]
  const getAvailableInstructions = () => {
    return availableInstructions.filter((x) => x.isVisible)
  }
  function prepareTokenGovernances() {
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
  async function getMintWithGovernances() {
    const mintGovernances = getGovernancesByAccountType(
      GovernanceAccountType.MintGovernance
    )
    const governedMintInfoAccounts: GovernedMintInfoAccount[] = []
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection,
      mintGovernances.map((x) => x.info.governedAccount)
    )
    mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
      const governance = mintGovernances[index]
      if (!mintAccountInfo) {
        throw new Error(
          `Missing mintAccountInfo for: ${governance.pubkey.toBase58()}`
        )
      }
      const data = Buffer.from(mintAccountInfo.data)
      const parsedMintInfo = parseMintAccountData(data) as MintInfo
      const obj = {
        governance,
        mintInfo: parsedMintInfo,
      }
      governedMintInfoAccounts.push(obj)
    })
    return governedMintInfoAccounts
  }
  const governedTokenAccounts = prepareTokenGovernances()
  return {
    governancesArray,
    getGovernancesByAccountType,
    availableInstructions,
    getAvailableInstructions,
    governedTokenAccounts,
    getMintWithGovernances,
    canUseTransferInstruction,
    canUseMintInstruction,
  }
}
