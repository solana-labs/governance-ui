import {
  DEFAULT_NATIVE_SOL_MINT,
  DEFAULT_NFT_TREASURY_MINT,
  HIDDEN_GOVERNANCES,
} from '@components/instructions/tools'
import {
  getNativeTreasuryAddress,
  GovernanceAccountType,
} from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { ParsedAccountData } from '@solana/web3.js'
import {
  AccountInfoGen,
  getMultipleAccountInfoChunked,
  GovernedMintInfoAccount,
  GovernedTokenAccount,
  parseMintAccountData,
} from '@utils/tokens'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'

export default function useGovernanceAssets() {
  const { governances, tokenMints, realmTokenAccounts } = useRealm()
  const connection = useWalletStore((s) => s.connection.current)
  const [governedTokenAccounts, setGovernedTokenAccounts] = useState<
    GovernedTokenAccount[]
  >([])
  const { ownVoterWeight, realm, symbol } = useRealm()
  const governancesArray = Object.keys(governances)
    .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
    .map((key) => governances[key])

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
      getGovernancesByAccountTypes(types).some((g) =>
        ownVoterWeight.canCreateProposal(g.account.config)
      )
    )
  }
  const tokenGovernances = getGovernancesByAccountTypes([
    GovernanceAccountType.TokenGovernanceV1,
    GovernanceAccountType.TokenGovernanceV2,
  ])
  const canMintRealmCommunityToken = () => {
    const governances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])
    return !!governances.find(
      (x) =>
        x.account.governedAccount.toBase58() ==
        realm?.account.communityMint.toBase58()
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
    governancesArray.some((g) =>
      ownVoterWeight.canCreateProposal(g.account.config)
    )

  const getAvailableInstructions = () => {
    return availableInstructions.filter((x) => x.isVisible)
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
  const nftsGovernedTokenAccounts = governedTokenAccounts.filter((x) => x.isNft)
  const canUseTokenTransferInstruction = governedTokenAccountsWithoutNfts.some(
    (g) =>
      g.governance &&
      ownVoterWeight.canCreateProposal(g.governance?.account?.config)
  )

  const availableInstructions = [
    {
      id: Instructions.CreateAssociatedTokenAccount,
      name: 'Create Associated Token Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.CreateSolendObligationAccount,
      name: 'Solend: Create Obligation Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.InitSolendObligationAccount,
      name: 'Solend: Init Obligation Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.DepositReserveLiquidityAndObligationCollateral,
      name: 'Solend: Deposit Funds',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.RefreshSolendReserve,
      name: 'Solend: Refresh Reserve',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.RefreshSolendObligation,
      name: 'Solend: Refresh Obligation',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.WithdrawObligationCollateralAndRedeemReserveLiquidity,
      name: 'Solend: Withdraw Funds',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.InitializeController,
      name: 'UXD: Initialize Controller',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.SetRedeemableGlobalSupplyCap,
      name: 'UXD: Set Redeemable Global Supply Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.SetMangoDepositoriesRedeemableSoftCap,
      name: 'UXD: Set Mango Depositories Redeemable Supply Soft Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.RegisterMangoDepository,
      name: 'UXD: Register Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.DepositInsuranceToMangoDepository,
      name: 'UXD: Deposit Insurance To Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.WithdrawInsuranceFromMangoDepository,
      name: 'UXD: Withdraw Insurance From Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.AddLiquidityRaydium,
      name: 'Raydium: Add To Liquidity Pool',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.RemoveLiquidityRaydium,
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
      id: Instructions.MangoMakeChangeMaxAccounts,
      name: 'Mango - change max accounts',
      isVisible: canUseProgramUpgradeInstruction && symbol === 'MNGO',
    },
    {
      id: Instructions.MangoChangeReferralFeeParams,
      name: 'Mango - change referral fee params',
      isVisible: canUseProgramUpgradeInstruction && symbol === 'MNGO',
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
  useEffect(() => {
    async function prepareTokenGovernances() {
      const governedTokenAccountsArray: GovernedTokenAccount[] = []

      for (const gov of tokenGovernances) {
        const realmTokenAccount = realmTokenAccounts.find(
          (x) =>
            x.publicKey.toBase58() === gov.account.governedAccount.toBase58()
        )
        const mint = tokenMints.find(
          (x) =>
            realmTokenAccount?.account.mint.toBase58() ===
            x.publicKey.toBase58()
        )
        const isNft = mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT
        const isSol = mint?.publicKey.toBase58() === DEFAULT_NATIVE_SOL_MINT
        let transferAddress = realmTokenAccount
          ? realmTokenAccount.publicKey
          : null
        let solAccount: null | AccountInfoGen<Buffer | ParsedAccountData> = null
        if (isNft) {
          transferAddress = gov.pubkey
        }
        if (isSol) {
          const solAddress = await getNativeTreasuryAddress(
            realm!.owner,
            gov.pubkey
          )
          transferAddress = solAddress
          const resp = await connection.getParsedAccountInfo(solAddress)
          const mintRentAmount = await connection.getMinimumBalanceForRentExemption(
            0
          )
          if (resp.value) {
            solAccount = resp.value as AccountInfoGen<
              Buffer | ParsedAccountData
            >
            solAccount.lamports =
              solAccount.lamports !== 0
                ? solAccount.lamports - mintRentAmount
                : solAccount.lamports
          }
        }
        const obj = {
          governance: gov,
          token: realmTokenAccount,
          mint,
          isNft,
          isSol,
          transferAddress,
          solAccount,
        }
        governedTokenAccountsArray.push(obj)
      }
      setGovernedTokenAccounts(governedTokenAccountsArray)
    }
    prepareTokenGovernances()
  }, [
    JSON.stringify(tokenMints),
    JSON.stringify(realmTokenAccounts),
    JSON.stringify(tokenGovernances),
    JSON.stringify(governances),
  ])
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
