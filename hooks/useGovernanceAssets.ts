import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import { Instructions, PackageEnum } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import { HELIUM_VSR_PLUGINS_PKS, VSR_PLUGIN_PKS } from '../constants/plugins'
import { useRealmQuery } from './queries/realm'
import { useRealmConfigQuery } from './queries/realmConfig'
import { useRealmGovernancesQuery } from './queries/governance'
import { useMemo } from 'react'
import { useRealmVoterWeights } from '@hooks/useRealmVoterWeightPlugins'
import { GovernanceConfig } from '@solana/spl-governance'

type Package = {
  name: string
  image?: string
  isVisible?: boolean
}

type Packages = {
  [packageId in PackageEnum]: Package
}

type PackageType = Package & {
  id: PackageEnum
}

type Instruction = {
  name: string
  isVisible?: boolean
  packageId: PackageEnum
  assetType?: 'token' | 'mint' | 'wallet'
}

type InstructionsMap = {
  [instructionId in Instructions]: Instruction
}

export type InstructionType = {
  id: Instructions
  name: string
  packageId: PackageEnum
}

export default function useGovernanceAssets() {
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const { communityWeight, councilWeight } = useRealmVoterWeights()
  const ownVoterWeights = {
    community: communityWeight?.value,
    council: councilWeight?.value,
  }

  const canCreateProposal = (config: GovernanceConfig) => {
    return (
      ownVoterWeights.community?.gte(
        config.minCommunityTokensToCreateProposal
      ) || ownVoterWeights.council?.gte(config.minCouncilTokensToCreateProposal)
    )
  }

  const governedTokenAccounts: AssetAccount[] = useGovernanceAssetsStore(
    (s) => s.governedTokenAccounts
  )

  const assetAccounts = useGovernanceAssetsStore((s) =>
    s.assetAccounts.filter((x) => x.type !== AccountType.AUXILIARY_TOKEN)
  )
  const auxiliaryTokenAccounts = useGovernanceAssetsStore(
    (s) => s.assetAccounts
  ).filter((x) => x.type === AccountType.AUXILIARY_TOKEN)
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const governancesQuery = useRealmGovernancesQuery()
  const governancesArray = useMemo(() => governancesQuery.data ?? [], [
    governancesQuery.data,
  ])

  function canUseGovernanceForInstruction(types: AccountType[]) {
    return (
      realm &&
      assetAccounts
        .filter((x) => types.find((t) => t === x.type))
        .some((govAcc) => canCreateProposal(govAcc.governance.account.config))
    )
  }
  const canMintRealmCouncilToken = () => {
    return !!assetAccounts.find(
      (x) =>
        x.pubkey.toBase58() == realm?.account.config.councilMint?.toBase58()
    )
  }
  const canUseTransferInstruction = governedTokenAccounts.some((acc) => {
    const governance = governancesArray.find(
      (x) => acc.governance.pubkey.toBase58() === x.pubkey.toBase58()
    )
    return governance && canCreateProposal(governance?.account?.config)
  })

  const canUseProgramUpgradeInstruction = canUseGovernanceForInstruction([
    AccountType.PROGRAM,
  ])

  const canUseMintInstruction = canUseGovernanceForInstruction([
    AccountType.MINT,
  ])

  const canUseAnyInstruction =
    realm &&
    governancesArray.some((gov) => canCreateProposal(gov.account.config))

  const realmAuth =
    realm &&
    governancesArray.find(
      (x) => x.pubkey.toBase58() === realm.account.authority?.toBase58()
    )
  const canUseAuthorityInstruction =
    realmAuth && canCreateProposal(realmAuth?.account.config)

  const governedSPLTokenAccounts = governedTokenAccounts.filter(
    (x) => x.type === AccountType.TOKEN
  )
  const governedTokenAccountsWithoutNfts = governedTokenAccounts.filter(
    (x) => x.type !== AccountType.NFT
  )
  const governedNativeAccounts = governedTokenAccounts.filter(
    (x) => x.type === AccountType.SOL
  )
  const canUseTokenTransferInstruction = governedTokenAccountsWithoutNfts.some(
    (acc) => {
      const governance = governancesArray.find(
        (x) => acc.governance.pubkey.toBase58() === x.pubkey.toBase58()
      )
      return governance && canCreateProposal(governance?.account?.config)
    }
  )

  // Alphabetical order
  // Images are in public/img/
  //
  // If an image is not set, then the name is displayed in the select
  // please use png with transparent background for logos
  //
  // Packages are visible by default
  const packages: Packages = {
    [PackageEnum.Common]: {
      name: 'Common',
    },
    [PackageEnum.Dual]: {
      name: 'Dual Finance',
      image: '/img/dual-logo.png',
    },
    [PackageEnum.Distribution]: {
      name: 'Distribution Program',
    },
    [PackageEnum.GatewayPlugin]: {
      name: 'Civic Plugin',
      image: '/img/civic.svg',
    },
    [PackageEnum.Identity]: {
      name: 'Identity',
      image: '/img/identity.png',
    },
    [PackageEnum.NftPlugin]: {
      name: 'NFT Plugin',
    },
    [PackageEnum.MangoMarketV4]: {
      name: 'Mango Market v4',
      image: '/img/mango.png',
    },
    [PackageEnum.MeanFinance]: {
      name: 'Mean Finance',
      image: '/img/meanfinance.png',
    },
    [PackageEnum.PsyFinance]: {
      name: 'PsyFinance',
      image: '/img/psyfinance.png',
    },
    [PackageEnum.Pyth]: {
      name: 'Pyth',
      image: '/img/pyth.svg',
    },
    [PackageEnum.Serum]: {
      name: 'Serum',
      image: '/img/serum.png',
      // Temporary:
      // Hide serum package for now, due to wallet disconnection bug
      isVisible: false,
    },
    [PackageEnum.Solend]: {
      name: 'Solend',
      image: '/img/solend.png',
    },
    [PackageEnum.Symmetry]: {
      name: 'Symmetry',
      image: '/img/symmetry.png',
    },
    [PackageEnum.Squads]: {
      name: 'Squads',
      image: '/img/squads.png',
    },
    [PackageEnum.Switchboard]: {
      name: 'Switchboard',
      image: '/img/switchboard.png',
    },
    [PackageEnum.VsrPlugin]: {
      name: 'Vsr Plugin',
      isVisible:
        currentPluginPk &&
        [...VSR_PLUGIN_PKS, ...HELIUM_VSR_PLUGINS_PKS].includes(
          currentPluginPk.toBase58()
        ),
    },
  }

  // Alphabetical order, Packages then instructions
  //
  // To generate package name comment, use:
  // https://patorjk.com/software/taag/#p=display&f=ANSI%20Regular&t=COMMON%0A
  //
  // If isVisible is not set, it is equal to canUseAnyInstruction
  const instructionsMap: InstructionsMap = {
    /*
        ██████  ██████  ███    ███ ███    ███  ██████  ███    ██
       ██      ██    ██ ████  ████ ████  ████ ██    ██ ████   ██
       ██      ██    ██ ██ ████ ██ ██ ████ ██ ██    ██ ██ ██  ██
       ██      ██    ██ ██  ██  ██ ██  ██  ██ ██    ██ ██  ██ ██
        ██████  ██████  ██      ██ ██      ██  ██████  ██   ████
     */
    [Instructions.RevokeGoverningTokens]: {
      name: 'Revoke Membership',
      packageId: PackageEnum.Common,
    },
    [Instructions.Base64]: {
      name: 'Execute Custom Instruction',
      packageId: PackageEnum.Common,
    },
    [Instructions.ChangeMakeDonation]: {
      name: 'Donation to Charity',
      packageId: PackageEnum.Common,
    },
    [Instructions.Clawback]: {
      name: 'Clawback',
      isVisible:
        canUseTokenTransferInstruction &&
        currentPluginPk &&
        VSR_PLUGIN_PKS.includes(currentPluginPk.toBase58()),
      packageId: PackageEnum.VsrPlugin,
    },
    [Instructions.CloseTokenAccount]: {
      name: 'Close token account',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.CloseMultipleTokenAccounts]: {
      name: 'Close multiple token accounts',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.CreateAssociatedTokenAccount]: {
      name: 'Create Associated Token Account',
      packageId: PackageEnum.Common,
    },
    [Instructions.CreateTokenMetadata]: {
      name: 'Create Token Metadata',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.DeactivateValidatorStake]: {
      name: 'Deactivate validator stake',
      packageId: PackageEnum.Common,
    },
    [Instructions.DelegateStake]: {
      name: 'Delegate Stake Account',
      packageId: PackageEnum.Common,
    },
    [Instructions.RemoveStakeLock]: {
      name: 'Stake Account Remove Lock',
      packageId: PackageEnum.Common,
    },
    [Instructions.DifferValidatorStake]: {
      name: 'Differ validator stake',
      // Not to be used for now
      isVisible: false,
      packageId: PackageEnum.Common,
    },
    [Instructions.Grant]: {
      name: 'Grant',
      isVisible:
        canUseTokenTransferInstruction &&
        currentPluginPk &&
        VSR_PLUGIN_PKS.includes(currentPluginPk.toBase58()),
      packageId: PackageEnum.VsrPlugin,
    },
    [Instructions.JoinDAO]: {
      name: 'Join a DAO',
      packageId: PackageEnum.Common,
    },
    [Instructions.Mint]: {
      name: 'Mint Tokens',
      isVisible: canUseMintInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.None]: {
      name: 'None',
      isVisible:
        realm &&
        governancesArray.some((g) => canCreateProposal(g.account.config)),
      packageId: PackageEnum.Common,
    },
    [Instructions.ProgramUpgrade]: {
      name: 'Upgrade Program',
      isVisible: canUseProgramUpgradeInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.RealmConfig]: {
      name: 'Realm config',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.StakeValidator]: {
      name: 'Stake A Validator',
      packageId: PackageEnum.Common,
    },
    [Instructions.SanctumDepositStake]: {
      name: 'Sanctum Deposit Stake',
      packageId: PackageEnum.Common,
    },
    [Instructions.SanctumWithdrawStake]: {
      name: 'Sanctum Withdraw Stake',
      packageId: PackageEnum.Common,
    },
    [Instructions.Transfer]: {
      name: 'Transfer Tokens',
      isVisible: canUseTokenTransferInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.Burn]: {
      name: 'Burn Tokens',
      isVisible: canUseTokenTransferInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.TransferDomainName]: {
      name: 'SNS Transfer Out Domain Name',
      packageId: PackageEnum.Common,
    },
    [Instructions.UpdateTokenMetadata]: {
      name: 'Update Token Metadata',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.WithdrawValidatorStake]: {
      name: 'Withdraw validator stake',
      packageId: PackageEnum.Common,
    },
    [Instructions.SetMintAuthority]: {
      name: 'Set Mint Authority',
      packageId: PackageEnum.Common,
    },
    [Instructions.SplitStake]: {
      name: 'Split Stake Validator',
      packageId: PackageEnum.Common,
    },
    [Instructions.DaoVote]: {
      name: 'Vote in another DAO',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.DualFinanceDelegateWithdraw]: {
      name: 'Withdraw Vote Deposit',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Common,
    },
    [Instructions.DualFinanceVoteDeposit]: {
      name: 'Join a VSR DAO',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Common,
    },
    /*
      ██████  ██    ██  █████  ██          ███████ ██ ███    ██  █████  ███    ██  ██████ ███████
      ██   ██ ██    ██ ██   ██ ██          ██      ██ ████   ██ ██   ██ ████   ██ ██      ██
      ██   ██ ██    ██ ███████ ██          █████   ██ ██ ██  ██ ███████ ██ ██  ██ ██      █████
      ██   ██ ██    ██ ██   ██ ██          ██      ██ ██  ██ ██ ██   ██ ██  ██ ██ ██      ██
      ██████   ██████  ██   ██ ███████     ██      ██ ██   ████ ██   ██ ██   ████  ██████ ███████
    */

    [Instructions.DualFinanceStakingOption]: {
      name: 'Staking Option',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceGso]: {
      name: 'Lockup Staking Option',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceLiquidityStakingOption]: {
      name: 'Liquidity Staking Option',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceInitStrike]: {
      name: 'Init Staking Option Strike',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceExerciseStakingOption]: {
      name: 'Exercise Staking Option',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceGsoWithdraw]: {
      name: 'Lockup Staking Option Withdraw',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceStakingOptionWithdraw]: {
      name: 'Withdraw',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceAirdrop]: {
      name: 'Airdrop',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },
    [Instructions.DualFinanceDelegate]: {
      name: 'Delegate',
      isVisible: canUseTransferInstruction,
      packageId: PackageEnum.Dual,
    },

    /*
      ██ ██████  ███████ ███    ██ ████████ ██ ████████ ██    ██
      ██ ██   ██ ██      ████   ██    ██    ██    ██     ██  ██
      ██ ██   ██ █████   ██ ██  ██    ██    ██    ██      ████
      ██ ██   ██ ██      ██  ██ ██    ██    ██    ██       ██
      ██ ██████  ███████ ██   ████    ██    ██    ██       ██
    */

    [Instructions.ConfigureGatewayPlugin]: {
      name: 'Configure',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.GatewayPlugin,
    },
    [Instructions.CreateGatewayPluginRegistrar]: {
      name: 'Create registrar',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.GatewayPlugin,
    },
    [Instructions.AddKeyToDID]: {
      name: 'Add Key to DID',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Identity,
    },
    [Instructions.RemoveKeyFromDID]: {
      name: 'Remove Key from DID',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Identity,
    },
    [Instructions.AddServiceToDID]: {
      name: 'Add Service to DID',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Identity,
    },
    [Instructions.RemoveServiceFromDID]: {
      name: 'Remove Service from DID',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Identity,
    },

    /*
      ███    ██ ███████ ████████     ██████  ██      ██    ██  ██████  ██ ███    ██
      ████   ██ ██         ██        ██   ██ ██      ██    ██ ██       ██ ████   ██
      ██ ██  ██ █████      ██        ██████  ██      ██    ██ ██   ███ ██ ██ ██  ██
      ██  ██ ██ ██         ██        ██      ██      ██    ██ ██    ██ ██ ██  ██ ██
      ██   ████ ██         ██        ██      ███████  ██████   ██████  ██ ██   ████
    */

    [Instructions.ConfigureNftPluginCollection]: {
      name: 'Configure collection',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.NftPlugin,
    },
    [Instructions.CreateNftPluginMaxVoterWeight]: {
      name: 'Create max voter weight',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.NftPlugin,
    },
    [Instructions.CreateNftPluginRegistrar]: {
      name: 'Create registrar',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.NftPlugin,
    },

    /*
      ███    ███  █████  ███    ██  ██████   ██████      ██    ██ ██   ██
      ████  ████ ██   ██ ████   ██ ██       ██    ██     ██    ██ ██   ██
      ██ ████ ██ ███████ ██ ██  ██ ██   ███ ██    ██     ██    ██ ███████
      ██  ██  ██ ██   ██ ██  ██ ██ ██    ██ ██    ██      ██  ██       ██
      ██      ██ ██   ██ ██   ████  ██████   ██████        ████        ██
    */

    [Instructions.MangoV4PerpCreate]: {
      name: 'Create Perp',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4PerpEdit]: {
      name: 'Edit Perp',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4OpenBookRegisterMarket]: {
      name: 'Register Openbook Market',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4TokenEdit]: {
      name: 'Edit Token',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4TokenRegister]: {
      name: 'Register Token',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4TokenRegisterTrustless]: {
      name: 'Register Trustless Token',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4GroupEdit]: {
      name: 'Edit Group',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4AdminWithdrawTokenFees]: {
      name: 'Withdraw Token Fees',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4WithdrawPerpFees]: {
      name: 'Withdraw Perp Fees',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4OpenBookEditMarket]: {
      name: 'Edit Openbook Market',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4IxGateSet]: {
      name: 'Enable/Disable individual instructions in Group',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4StubOracleCreate]: {
      name: 'Create Stub Oracle',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4StubOracleSet]: {
      name: 'Set Stub Oracle Value',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4AltSet]: {
      name: 'Set Address Lookup Table for Group',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4AltExtend]: {
      name: 'Extend Address Lookup Table',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.MangoV4TokenAddBank]: {
      name: 'Add additional Bank to an existing Token',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    [Instructions.IdlSetBuffer]: {
      name: 'Idl Set Buffer',
      packageId: PackageEnum.MangoMarketV4,
      isVisible: canUseAnyInstruction,
    },
    /*
      ███    ███ ███████  █████  ███    ██     ███████ ██ ███    ██  █████  ███    ██  ██████ ███████
      ████  ████ ██      ██   ██ ████   ██     ██      ██ ████   ██ ██   ██ ████   ██ ██      ██
      ██ ████ ██ █████   ███████ ██ ██  ██     █████   ██ ██ ██  ██ ███████ ██ ██  ██ ██      █████
      ██  ██  ██ ██      ██   ██ ██  ██ ██     ██      ██ ██  ██ ██ ██   ██ ██  ██ ██ ██      ██
      ██      ██ ███████ ██   ██ ██   ████     ██      ██ ██   ████ ██   ██ ██   ████  ██████ ███████
    */

    [Instructions.MeanCreateAccount]: {
      name: 'Payment Stream: New account',
      packageId: PackageEnum.MeanFinance,
    },
    [Instructions.MeanFundAccount]: {
      name: 'Payment Stream: Fund account',
      packageId: PackageEnum.MeanFinance,
    },
    [Instructions.MeanWithdrawFromAccount]: {
      name: 'Payment Stream: Withdraw funds',
      packageId: PackageEnum.MeanFinance,
    },
    [Instructions.MeanCreateStream]: {
      name: 'Payment Stream: New stream',
      packageId: PackageEnum.MeanFinance,
    },
    [Instructions.MeanTransferStream]: {
      name: 'Payment Stream: Transfer stream',
      packageId: PackageEnum.MeanFinance,
    },

    /*
      ██████  ███████ ██    ██  ███████ ██ ███    ██  █████  ███    ██  ██████ ███████
      ██   ██ ██       ██  ██   ██      ██ ████   ██ ██   ██ ████   ██ ██      ██     
      ██████  ███████   ████    █████   ██ ██ ██  ██ ███████ ██ ██  ██ ██      █████  
      ██           ██    ██     ██      ██ ██  ██ ██ ██   ██ ██  ██ ██ ██      ██      
      ██      ███████    ██     ██      ██ ██   ████ ██   ██ ██   ████  ██████ ███████ 
    */

    [Instructions.PsyFinanceMintAmericanOptions]: {
      name: ' Mint American Options',
      packageId: PackageEnum.PsyFinance,
    },
    [Instructions.PsyFinanceBurnWriterForQuote]: {
      name: 'Claim Quote with Writer Token',
      packageId: PackageEnum.PsyFinance,
    },
    [Instructions.PsyFinanceClaimUnderlyingPostExpiration]: {
      name: 'Claim Underlying (post expiration)',
      packageId: PackageEnum.PsyFinance,
    },
    [Instructions.PsyFinanceExerciseOption]: {
      name: 'Exercise Option',
      packageId: PackageEnum.PsyFinance,
    },

    /*
      ██████  ██    ██ ████████ ██   ██
      ██   ██  ██  ██     ██    ██   ██
      ██████    ████      ██    ███████
      ██         ██       ██    ██   ██
      ██         ██       ██    ██   ██
    */
    [Instructions.PythRecoverAccount]: {
      name: 'Recover Account',
      packageId: PackageEnum.Pyth,
    },
    [Instructions.PythUpdatePoolAuthority]: {
      name: 'Update Pool Authority',
      packageId: PackageEnum.Pyth,
    },
    /*
      ███████ ███████ ██████  ██    ██ ███    ███
      ██      ██      ██   ██ ██    ██ ████  ████
      ███████ █████   ██████  ██    ██ ██ ████ ██
           ██ ██      ██   ██ ██    ██ ██  ██  ██
      ███████ ███████ ██   ██  ██████  ██      ██
    */

    [Instructions.SerumGrantLockedMSRM]: {
      name: 'Grant Locked MSRM',
      packageId: PackageEnum.Serum,
    },
    [Instructions.SerumGrantLockedSRM]: {
      name: 'Grant Locked SRM',
      packageId: PackageEnum.Serum,
    },
    [Instructions.SerumGrantVestMSRM]: {
      name: 'Grant Vested MSRM',
      packageId: PackageEnum.Serum,
    },
    [Instructions.SerumGrantVestSRM]: {
      name: 'Grant Vested SRM',
      packageId: PackageEnum.Serum,
    },
    [Instructions.SerumInitUser]: {
      name: 'Init User Account',
      packageId: PackageEnum.Serum,
    },
    [Instructions.SerumUpdateGovConfigAuthority]: {
      name: 'Update Governance Config Authority',
      packageId: PackageEnum.Serum,
    },
    [Instructions.SerumUpdateGovConfigParams]: {
      name: 'Update Governance Config Params',
      packageId: PackageEnum.Serum,
    },

    /*
      ███████  ██████  ██      ███████ ███    ██ ██████
      ██      ██    ██ ██      ██      ████   ██ ██   ██
      ███████ ██    ██ ██      █████   ██ ██  ██ ██   ██
           ██ ██    ██ ██      ██      ██  ██ ██ ██   ██
      ███████  ██████  ███████ ███████ ██   ████ ██████
    */

    [Instructions.CreateSolendObligationAccount]: {
      name: 'Create Obligation Account',
      packageId: PackageEnum.Solend,
    },
    [Instructions.DepositReserveLiquidityAndObligationCollateral]: {
      name: 'Deposit Funds',
      packageId: PackageEnum.Solend,
    },
    [Instructions.InitSolendObligationAccount]: {
      name: 'Init Obligation Account',
      packageId: PackageEnum.Solend,
    },
    [Instructions.RefreshSolendObligation]: {
      name: 'Refresh Obligation',
      packageId: PackageEnum.Solend,
    },
    [Instructions.RefreshSolendReserve]: {
      name: 'Refresh Reserve',
      packageId: PackageEnum.Solend,
    },
    [Instructions.WithdrawObligationCollateralAndRedeemReserveLiquidity]: {
      name: 'Withdraw Funds',
      packageId: PackageEnum.Solend,
    },

    /*
    ███████ ██    ██ ███    ███ ███    ███ ███████ ████████ ██████  ██    ██ 
    ██       ██  ██  ████  ████ ████  ████ ██         ██    ██   ██  ██  ██  
    ███████   ████   ██ ████ ██ ██ ████ ██ █████      ██    ██████    ████   
         ██    ██    ██  ██  ██ ██  ██  ██ ██         ██    ██   ██    ██    
    ███████    ██    ██      ██ ██      ██ ███████    ██    ██   ██    ██    
    */
    [Instructions.SymmetryCreateBasket]: {
      name: 'Create Basket',
      packageId: PackageEnum.Symmetry,
    },
    [Instructions.SymmetryEditBasket]: {
      name: 'Edit Basket',
      packageId: PackageEnum.Symmetry,
    },
    [Instructions.SymmetryDeposit]: {
      name: 'Deposit into Basket',
      packageId: PackageEnum.Symmetry,
    },
    [Instructions.SymmetryWithdraw]: {
      name: 'Withdraw from Basket',
      packageId: PackageEnum.Symmetry,
    },
    /*
    ███████  ██████  ██    ██  █████  ██████  ███████ 
    ██      ██    ██ ██    ██ ██   ██ ██   ██ ██      
    ███████ ██    ██ ██    ██ ███████ ██   ██ ███████ 
         ██ ██ ▄▄ ██ ██    ██ ██   ██ ██   ██      ██ 
    ███████  ██████   ██████  ██   ██ ██████  ███████ 
    */
    [Instructions.SquadsMeshAddMember]: {
      name: 'Mesh Add Member',
      packageId: PackageEnum.Squads,
    },
    [Instructions.SquadsMeshChangeThresholdMember]: {
      name: 'Mesh Change Threshold',
      packageId: PackageEnum.Squads,
    },
    [Instructions.SquadsMeshRemoveMember]: {
      name: 'Mesh Remove Member',
      packageId: PackageEnum.Squads,
    },
    /*
      ███████ ██     ██ ██ ████████  ██████ ██   ██ ██████   ██████   █████  ██████  ██████
      ██      ██     ██ ██    ██    ██      ██   ██ ██   ██ ██    ██ ██   ██ ██   ██ ██   ██
      ███████ ██  █  ██ ██    ██    ██      ███████ ██████  ██    ██ ███████ ██████  ██   ██
           ██ ██ ███ ██ ██    ██    ██      ██   ██ ██   ██ ██    ██ ██   ██ ██   ██ ██   ██
      ███████  ███ ███  ██    ██     ██████ ██   ██ ██████   ██████  ██   ██ ██   ██ ██████
    */

    [Instructions.SwitchboardFundOracle]: {
      name: 'Fund Oracle',
      packageId: PackageEnum.Switchboard,
    },
    [Instructions.WithdrawFromOracle]: {
      name: 'Withdraw from Oracle',
      packageId: PackageEnum.Switchboard,
    },

    /*
      ██    ██ ███████ ██████      ██████  ██      ██    ██  ██████  ██ ███    ██
      ██    ██ ██      ██   ██     ██   ██ ██      ██    ██ ██       ██ ████   ██
      ██    ██ ███████ ██████      ██████  ██      ██    ██ ██   ███ ██ ██ ██  ██
       ██  ██       ██ ██   ██     ██      ██      ██    ██ ██    ██ ██ ██  ██ ██
        ████   ███████ ██   ██     ██      ███████  ██████   ██████  ██ ██   ████
    */

    [Instructions.CreateVsrRegistrar]: {
      name: 'Vote Escrowed Tokens: Create Registrar',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.VsrPlugin,
    },
    [Instructions.VotingMintConfig]: {
      name: 'Vote Escrowed Tokens: Configure Voting Mint',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.VsrPlugin,
    },

    [Instructions.DistributionCloseVaults]: {
      name: 'Close vaults',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.Distribution,
    },
    [Instructions.DistributionFillVaults]: {
      name: 'Fill vaults',
      isVisible: canUseAuthorityInstruction,
      packageId: PackageEnum.Distribution,
    },
  }

  const availablePackages: PackageType[] = Object.entries(packages)
    .filter(([, { isVisible }]) =>
      typeof isVisible === 'undefined' ? true : isVisible
    )
    .map(([id, infos]) => ({
      id: Number(id) as PackageEnum,
      ...infos,
    }))

  const availableInstructions = Object.entries(instructionsMap)
    .filter(([, { isVisible, packageId }]) => {
      // do not display if the instruction's package is not visible
      if (!availablePackages.some(({ id }) => id === packageId)) {
        return false
      }

      return typeof isVisible === 'undefined' ? canUseAnyInstruction : isVisible
    })
    .map(([id, { name, packageId }]) => ({
      id: Number(id) as Instructions,
      name,
      packageId,
    }))

  const getPackageTypeById = (packageId: PackageEnum) => {
    return availablePackages.find(
      (availablePackage) => availablePackage.id === packageId
    )
  }

  return {
    assetAccounts,
    auxiliaryTokenAccounts,
    availableInstructions,
    availablePackages,
    canMintRealmCouncilToken,
    canUseAuthorityInstruction,
    canUseMintInstruction,
    canUseProgramUpgradeInstruction,
    canUseTransferInstruction,
    getPackageTypeById,
    governancesArray,
    governedNativeAccounts,
    governedSPLTokenAccounts,
    governedTokenAccounts,
    governedTokenAccountsWithoutNfts,
  }
}
