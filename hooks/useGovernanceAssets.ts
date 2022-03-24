import { GovernanceAccountType } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import {
  getMultipleAccountInfoChunked,
  GovernedMintInfoAccount,
  parseMintAccountData,
} from '@utils/tokens'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import useRealm from './useRealm'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'

export default function useGovernanceAssets() {
  const { ownVoterWeight, realm, symbol, governances } = useRealm()
  const connection = useWalletStore((s) => s.connection.current)
  const governedTokenAccounts = useGovernanceAssetsStore(
    (s) => s.governedTokenAccounts
  )
  const governancesArray = useGovernanceAssetsStore((s) => s.governancesArray)

  const getGovernancesByAccountType = (type: GovernanceAccountType) => {
    const governancesFiltered = governancesArray.filter(
      (gov) => gov.account?.accountType === type
    )
    return governancesFiltered
  }

  const getGovernancesByAccountTypes = (types: GovernanceAccountType[]) => {
    const governancesFiltered = governancesArray.filter((gov) =>
      types.some((t) => gov.account?.accountType === t)
    )
    return governancesFiltered
  }

  function canUseGovernanceForInstruction(types: GovernanceAccountType[]) {
    return (
      realm &&
      getGovernancesByAccountTypes(types).some((govAcc) =>
        ownVoterWeight.canCreateProposal(govAcc.account.config)
      )
    )
  }
  const canMintRealmCommunityToken = () => {
    const governances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])
    return !!governances.find((govAcc) =>
      realm?.account.communityMint.equals(govAcc.account.governedAccount)
    )
  }
  const canMintRealmCouncilToken = () => {
    const governances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])

    return !!governances.find(
      (x) =>
        x.account.governedAccount.toBase58() ==
        realm?.account.config.councilMint?.toBase58()
    )
  }
  // TODO: Check governedAccounts from all governances plus search for token accounts owned by governances
  const canUseTransferInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.TokenGovernanceV1,
    GovernanceAccountType.TokenGovernanceV2,
  ])

  const canUseProgramUpgradeInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])

  const canUseMintInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.MintGovernanceV1,
    GovernanceAccountType.MintGovernanceV2,
  ])

  const canUseUxdInstructions =
    symbol === 'UXP' &&
    canUseGovernanceForInstruction([
      GovernanceAccountType.ProgramGovernanceV1,
      GovernanceAccountType.ProgramGovernanceV2,
    ])

  const canUseAnyInstruction =
    realm &&
    governancesArray.some((gov) =>
      ownVoterWeight.canCreateProposal(gov.account.config)
    )

  const getAvailableInstructions = () => {
    return availableInstructions.filter((itx) => itx.isVisible)
  }

  async function getMintWithGovernances() {
    const mintGovernances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])
    const governedMintInfoAccounts: GovernedMintInfoAccount[] = []
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection,
      mintGovernances.map((x) => x.account.governedAccount)
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

  const governedTokenAccountsWithoutNfts = governedTokenAccounts.filter(
    (x) => !x.isNft
  )
  const nftsGovernedTokenAccounts = governedTokenAccounts.filter(
    (govTokenAcc) => govTokenAcc.isNft
  )
  const canUseTokenTransferInstruction = governedTokenAccountsWithoutNfts.some(
    (acc) =>
      acc.governance &&
      ownVoterWeight.canCreateProposal(acc.governance?.account?.config)
  )

  const availableInstructions = [
    {
      id: Instructions.SolendCreateObligationAccount,
      name: 'Solend: Create Obligation Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.SolendInitObligationAccount,
      name: 'Solend: Init Obligation Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.SolendDepositReserveLiquidityAndObligationCollateral,
      name: 'Solend: Deposit Funds',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.SolendRefreshReserve,
      name: 'Solend: Refresh Reserve',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.SolendRefreshObligation,
      name: 'Solend: Refresh Obligation',
      isVisible: canUseAnyInstruction,
    },
    {
      id:
        Instructions.SolendWithdrawObligationCollateralAndRedeemReserveLiquidity,
      name: 'Solend: Withdraw Funds',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.UXDInitializeController,
      name: 'UXD: Initialize Controller',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.UXDSetRedeemableGlobalSupplyCap,
      name: 'UXD: Set Redeemable Global Supply Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.UXDSetMangoDepositoriesRedeemableSoftCap,
      name: 'UXD: Set Mango Depositories Redeemable Supply Soft Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.UXDRegisterMangoDepository,
      name: 'UXD: Register Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.UXDDepositInsuranceToMangoDepository,
      name: 'UXD: Deposit Insurance To Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.UXDWithdrawInsuranceFromMangoDepository,
      name: 'UXD: Withdraw Insurance From Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.RaydiumAddLiquidity,
      name: 'Raydium: Add To Liquidity Pool',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.RaydiumRemoveLiquidity,
      name: 'Raydium: Remove From Liquidity Pool',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.Transfer,
      name: 'Transfer Tokens',
      isVisible: canUseTokenTransferInstruction,
    },
    {
      id: Instructions.Grant,
      name: 'Grant',
      isVisible:
        canUseTokenTransferInstruction &&
        realm?.account.config.useCommunityVoterWeightAddin,
    },
    {
      id: Instructions.Clawback,
      name: 'Clawback',
      isVisible:
        canUseTokenTransferInstruction &&
        realm?.account.config.useCommunityVoterWeightAddin,
    },
    {
      id: Instructions.CreateAssociatedTokenAccount,
      name: 'Create Associated Token Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.FriktionDepositIntoVolt,
      name: 'Friktion: Deposit into Volt',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.ProgramUpgrade,
      name: 'Upgrade Program',
      isVisible: canUseProgramUpgradeInstruction,
    },
    {
      id: Instructions.SetProgramAuthority,
      name: 'Set Program Authority',
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
          ownVoterWeight.canCreateProposal(g.account.config)
        ),
    },
  ]
  return {
    governancesArray,
    getGovernancesByAccountType,
    getGovernancesByAccountTypes,
    availableInstructions,
    getAvailableInstructions,
    governedTokenAccounts,
    getMintWithGovernances,
    canUseTransferInstruction,
    canUseMintInstruction,
    canMintRealmCommunityToken,
    canMintRealmCouncilToken,
    canUseProgramUpgradeInstruction,
    governedTokenAccountsWithoutNfts,
    nftsGovernedTokenAccounts,
  }
}
