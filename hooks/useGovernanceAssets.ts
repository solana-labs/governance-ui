import { GovernanceAccountType } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import {
  getMultipleAccountInfoChunked,
  GovernedMintInfoAccount,
  parseMintAccountData,
} from '@utils/tokens'
import {
  InstructionEnum,
  PackageEnum,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import useRealm from './useRealm'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'

export type InstructionTag = 'beta' | 'deprecated'

type Instruction = {
  name: string
  isVisible?: boolean
  packageId: PackageEnum
  tag?: InstructionTag
}

type Instructions = {
  [instructionId in InstructionEnum]: Instruction
}

export type InstructionType = {
  id: InstructionEnum
  name: string
  packageId: PackageEnum
  tag?: InstructionTag
}

type Package = {
  name: string
  image?: string
}

type Packages = {
  [packageId in PackageEnum]: Package
}

export type PackageType = Package & {
  id: PackageEnum
}

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

  const packages: Packages = {
    [PackageEnum.Native]: {
      name: 'Native',
    },
    [PackageEnum.VoteStakeRegistry]: {
      name: 'Vote Stake Registry',
      image: '/img/vote-stake-registry.png',
    },
    [PackageEnum.Solend]: {
      name: 'Solend',
      image: '/img/solend.png',
    },
    [PackageEnum.Raydium]: {
      name: 'Raydium',
      image: '/img/raydium.png',
    },
    [PackageEnum.UXD]: {
      name: 'UXD',
      image: '/img/uxd.png',
    },
    [PackageEnum.UXDStaking]: {
      name: 'UXD Staking',
      image: '/img/uxd-staking.png',
    },
    [PackageEnum.Friktion]: {
      name: 'Friktion',
      image: '/img/friktion.png',
    },
    [PackageEnum.Tribeca]: {
      name: 'Tribeca',
      image: '/img/tribeca.png',
    },
    [PackageEnum.Socean]: {
      name: 'Socean',
      image: '/img/socean.png',
    },
  }

  const instructions: Instructions = {
    [InstructionEnum.TribecaCreateEpochGauge]: {
      name: 'Tribeca: Create Epoch Gauge',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaCreateEscrowGovernanceTokenATA]: {
      name: 'Tribeca: Create Escrow Governance Token ATA',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaCreateGaugeVote]: {
      name: 'Tribeca: Create Gauge Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaCreateGaugeVoter]: {
      name: 'Tribeca: Create Gauge Voter',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaGaugeCommitVote]: {
      name: 'Tribeca: Gauge Commit Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaGaugeRevertVote]: {
      name: 'Tribeca: Gauge Revert Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaLock]: {
      name: 'Tribeca: Lock Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaNewEscrow]: {
      name: 'Tribeca: New Escrow',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaPrepareEpochGaugeVoter]: {
      name: 'Tribeca: Prepare Epoch Gauge Voter',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaResetEpochGaugeVoter]: {
      name: 'Tribeca: Reset Epoch Gauge Voter',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaGaugeSetVote]: {
      name: 'Tribeca: Set Gauge Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.SoceanMintBondedTokens]: {
      name: 'Socean: Mint Bonded Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanDepositToAuctionPool]: {
      name: 'Socean: Deposit to Auction',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanPurchaseBondedTokens]: {
      name: 'Socean: Purchase Bonded Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanCloseAuction]: {
      name: 'Socean: Close Auction',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanVest]: {
      name: 'Socean: Vest',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanCancelVest]: {
      name: 'Socean: Cancel Vest',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SolendCreateObligationAccount]: {
      name: 'Solend: Create Obligation Account',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Solend,
    },
    [InstructionEnum.SolendCreateObligationAccount]: {
      name: 'Create Obligation Account',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Solend,
    },
    [InstructionEnum.SolendInitObligationAccount]: {
      name: 'Init Obligation Account',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Solend,
    },
    [InstructionEnum.SolendDepositReserveLiquidityAndObligationCollateral]: {
      name: 'Deposit Funds',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Solend,
    },
    [InstructionEnum.SolendRefreshReserve]: {
      name: 'Refresh Reserve',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Solend,
    },
    [InstructionEnum.SolendRefreshObligation]: {
      name: 'Refresh Obligation',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Solend,
    },
    [InstructionEnum.SolendWithdrawObligationCollateralAndRedeemReserveLiquidity]: {
      name: 'Withdraw Funds',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Solend,
    },
    [InstructionEnum.UXDInitializeController]: {
      name: 'Initialize Controller',
      isVisible: canUseUxdInstructions,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDSetRedeemableGlobalSupplyCap]: {
      name: 'Set Redeemable Global Supply Cap',
      isVisible: canUseUxdInstructions,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDSetMangoDepositoriesRedeemableSoftCap]: {
      name: 'Set Mango Depositories Redeemable Supply Soft Cap',
      isVisible: canUseUxdInstructions,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDRegisterMangoDepository]: {
      name: 'Register Mango Depository',
      isVisible: canUseUxdInstructions,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDDepositInsuranceToMangoDepository]: {
      name: 'Deposit Insurance To Mango Depository',
      isVisible: canUseUxdInstructions,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDWithdrawInsuranceFromMangoDepository]: {
      name: 'Withdraw Insurance From Mango Depository',
      isVisible: canUseUxdInstructions,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.RaydiumAddLiquidity]: {
      name: 'Add To Liquidity Pool',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Raydium,
    },
    [InstructionEnum.RaydiumRemoveLiquidity]: {
      name: 'Remove From Liquidity Pool',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Raydium,
    },
    [InstructionEnum.FriktionDepositIntoVolt]: {
      name: 'Deposit into Volt',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Friktion,
    },
    [InstructionEnum.Transfer]: {
      name: 'Transfer Tokens',
      isVisible: canUseTokenTransferInstruction,
      packageId: PackageEnum.Native,
      tag: 'deprecated',
    },
    [InstructionEnum.Grant]: {
      name: 'Grant',
      isVisible:
        canUseTokenTransferInstruction &&
        realm?.account.config.useCommunityVoterWeightAddin,
      packageId: PackageEnum.VoteStakeRegistry,
      tag: 'deprecated',
    },
    [InstructionEnum.Clawback]: {
      name: 'Clawback',
      isVisible:
        canUseTokenTransferInstruction &&
        realm?.account.config.useCommunityVoterWeightAddin,
      packageId: PackageEnum.VoteStakeRegistry,
      tag: 'deprecated',
    },
    [InstructionEnum.CreateAssociatedTokenAccount]: {
      name: 'Create Associated Token Account',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.ProgramUpgrade]: {
      name: 'Upgrade Program',
      isVisible: canUseProgramUpgradeInstruction,
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.SetProgramAuthority]: {
      name: 'Set Program Authority',
      isVisible: canUseProgramUpgradeInstruction,
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.Mint]: {
      name: 'Mint Tokens',
      isVisible: canUseMintInstruction,
      packageId: PackageEnum.Native,
      tag: 'deprecated',
    },
    [InstructionEnum.Base64]: {
      name: 'Execute Custom Instruction',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.None]: {
      name: 'None',
      isVisible: !!(
        realm &&
        Object.values(governances).some((g) =>
          ownVoterWeight.canCreateProposal(g.account.config)
        )
      ),
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.UXDStakingInitializeStakingCampaign]: {
      name: 'Initialize Staking Campaign',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXDStaking,
    },
    [InstructionEnum.UXDStakingFinalizeStakingCampaign]: {
      name: 'Finalize Staking Campaign',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXDStaking,
    },
    [InstructionEnum.UXDStakingAddStakingOption]: {
      name: 'Add Staking Option',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXDStaking,
    },
    [InstructionEnum.UXDStakingActivateStakingOption]: {
      name: 'Activate Staking Option',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXDStaking,
    },
    [InstructionEnum.UXDStakingRefillRewardVault]: {
      name: 'UXD Staking: Refill Reward Vault',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXDStaking,
    },
  }

  const availableInstructions = Object.entries(instructions)
    .filter(
      ([, { isVisible }]) => typeof isVisible === 'undefined' || isVisible
    )
    .map(([id, { name, packageId, tag }]) => ({
      id: Number(id) as InstructionEnum,
      name,
      packageId,
      tag,
    }))

  const availablePackages: PackageType[] = Object.entries(packages).map(
    ([id, infos]) => ({
      id: Number(id) as PackageEnum,
      ...infos,
    })
  )

  const getPackageTypeById = (packageId: PackageEnum) => {
    return availablePackages.find(
      (availablePackage) => availablePackage.id === packageId
    )
  }

  return {
    governancesArray,
    getGovernancesByAccountType,
    getGovernancesByAccountTypes,
    availablePackages,
    availableInstructions,
    governedTokenAccounts,
    getMintWithGovernances,
    getPackageTypeById,
    canUseTransferInstruction,
    canUseMintInstruction,
    canMintRealmCommunityToken,
    canMintRealmCouncilToken,
    canUseProgramUpgradeInstruction,
    governedTokenAccountsWithoutNfts,
    nftsGovernedTokenAccounts,
  }
}
