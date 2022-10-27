import { GovernanceAccountType } from '@solana/spl-governance';
import { MintInfo } from '@solana/spl-token';
import {
  getMultipleAccountInfoChunked,
  GovernedMintInfoAccount,
  parseMintAccountData,
} from '@utils/tokens';
import {
  InstructionEnum,
  PackageEnum,
} from '@utils/uiTypes/proposalCreationTypes';

import useWalletStore from 'stores/useWalletStore';

import useRealm from './useRealm';
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore';

export type InstructionTag = 'beta' | 'deprecated';

type Instruction = {
  name: string;
  isVisible?: boolean;
  packageId: PackageEnum;
  tag?: InstructionTag;
};

type Instructions = {
  [instructionId in InstructionEnum]: Instruction;
};

export type InstructionType = {
  id: InstructionEnum;
  name: string;
  packageId: PackageEnum;
  tag?: InstructionTag;
};

type Package = {
  name: string;
  image?: string;
};

type Packages = {
  [packageId in PackageEnum]: Package;
};

export type PackageType = Package & {
  id: PackageEnum;
};

export default function useGovernanceAssets() {
  const { ownVoterWeight, realm, governances } = useRealm();
  const connection = useWalletStore((s) => s.connection.current);
  const governedTokenAccounts = useGovernanceAssetsStore(
    (s) => s.governedTokenAccounts,
  );
  const governancesArray = useGovernanceAssetsStore((s) => s.governancesArray);

  const getGovernancesByAccountType = (type: GovernanceAccountType) => {
    const governancesFiltered = governancesArray.filter(
      (gov) => gov.account?.accountType === type,
    );
    return governancesFiltered;
  };

  const getGovernancesByAccountTypes = (types: GovernanceAccountType[]) => {
    const governancesFiltered = governancesArray.filter((gov) =>
      types.some((t) => gov.account?.accountType === t),
    );
    return governancesFiltered;
  };

  function canUseGovernanceForInstruction(types: GovernanceAccountType[]) {
    return (
      realm &&
      getGovernancesByAccountTypes(types).some((govAcc) =>
        ownVoterWeight.canCreateProposal(govAcc.account.config),
      )
    );
  }
  const canMintRealmCommunityToken = () => {
    const governances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ]);
    return !!governances.find((govAcc) =>
      realm?.account.communityMint.equals(govAcc.account.governedAccount),
    );
  };
  const canMintRealmCouncilToken = () => {
    const governances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ]);

    return !!governances.find(
      (x) =>
        x.account.governedAccount.toBase58() ==
        realm?.account.config.councilMint?.toBase58(),
    );
  };
  // TODO: Check governedAccounts from all governances plus search for token accounts owned by governances
  const canUseTransferInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.TokenGovernanceV1,
    GovernanceAccountType.TokenGovernanceV2,
  ]);

  const canUseProgramUpgradeInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ]);

  const canUseMintInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.MintGovernanceV1,
    GovernanceAccountType.MintGovernanceV2,
  ]);

  const canUseAnyInstruction =
    realm &&
    governancesArray.some((gov) =>
      ownVoterWeight.canCreateProposal(gov.account.config),
    );

  async function getMintWithGovernances() {
    const mintGovernances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ]);
    const governedMintInfoAccounts: GovernedMintInfoAccount[] = [];
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection,
      mintGovernances.map((x) => x.account.governedAccount),
    );
    mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
      const governance = mintGovernances[index];
      if (!mintAccountInfo) {
        throw new Error(
          `Missing mintAccountInfo for: ${governance.pubkey.toBase58()}`,
        );
      }
      const data = Buffer.from(mintAccountInfo.data as Buffer);
      const parsedMintInfo = parseMintAccountData(data) as MintInfo;
      const obj = {
        governance,
        mintInfo: parsedMintInfo,
      };
      governedMintInfoAccounts.push(obj);
    });
    return governedMintInfoAccounts;
  }

  const governedTokenAccountsWithoutNfts = governedTokenAccounts.filter(
    (x) => !x.isNft,
  );
  const nftsGovernedTokenAccounts = governedTokenAccounts.filter(
    (govTokenAcc) => govTokenAcc.isNft,
  );
  const canUseTokenTransferInstruction = governedTokenAccountsWithoutNfts.some(
    (acc) =>
      acc.governance &&
      ownVoterWeight.canCreateProposal(acc.governance?.account?.config),
  );

  const packages: Packages = {
    [PackageEnum.Native]: {
      name: 'Native',
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
    [PackageEnum.Lifinity]: {
      name: 'Lifinity',
      image: '/img/lifinity.png',
    },
    [PackageEnum.Tribeca]: {
      name: 'Tribeca',
      image: '/img/tribeca.png',
    },
    [PackageEnum.Socean]: {
      name: 'Socean',
      image: '/img/socean.png',
    },
    [PackageEnum.Saber]: {
      name: 'Saber',
      image: '/img/saber.png',
    },
    [PackageEnum.Quarry]: {
      name: 'Quarry',
      image: '/img/quarry.png',
    },
    [PackageEnum.MapleFinance]: {
      name: 'Maple Finance',
      image: '/img/mapleFinance.png',
    },
    [PackageEnum.Deltafi]: {
      name: 'Deltafi',
      image: '/img/deltafi.png',
    },
    [PackageEnum.Orca]: {
      name: 'Orca',
      image: '/img/orca.svg',
    },
    [PackageEnum.Mercurial]: {
      name: 'Mercurial',
      image: '/img/mercurial.png',
    },
    [PackageEnum.Credix]: {
      name: 'Credix',
      image: '/img/credix.jpeg',
    },
  };

  const instructions: Instructions = {
    [InstructionEnum.MapleFinanceLenderDepositForm]: {
      name: 'Lender Deposit',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.MapleFinance,
      tag: 'beta',
    },
    [InstructionEnum.LifinityDepositToPool]: {
      name: 'Deposit To Pool',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Lifinity,
    },
    [InstructionEnum.LifinityWithdrawFromPool]: {
      name: 'Withdraw From Pool',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Lifinity,
    },
    [InstructionEnum.QuarryClaimRewards]: {
      name: 'Claim Rewards',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Quarry,
    },
    [InstructionEnum.QuarryCreateMiner]: {
      name: 'Create Miner',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Quarry,
    },
    [InstructionEnum.QuarryCreateMinerVaultAccount]: {
      name: 'Create Miner Vault Account',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Quarry,
    },
    [InstructionEnum.QuarryStakeTokens]: {
      name: 'Stake Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Quarry,
    },
    [InstructionEnum.QuarryWithdrawTokens]: {
      name: 'Withdraw Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Quarry,
    },
    [InstructionEnum.TribecaCreateEpochGauge]: {
      name: 'Create Epoch Gauge',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaCreateEscrowGovernanceTokenATA]: {
      name: 'Create Escrow Governance Token ATA',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaCreateGaugeVote]: {
      name: 'Create Gauge Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaCreateGaugeVoter]: {
      name: 'Create Gauge Voter',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaGaugeCommitVote]: {
      name: 'Gauge Commit Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaGaugeRevertVote]: {
      name: 'Gauge Revert Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaLock]: {
      name: 'Lock Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaNewEscrow]: {
      name: 'New Escrow',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaPrepareEpochGaugeVoter]: {
      name: 'Prepare Epoch Gauge Voter',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaResetEpochGaugeVoter]: {
      name: 'Reset Epoch Gauge Voter',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.TribecaGaugeSetVote]: {
      name: 'Set Gauge Vote',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Tribeca,
    },
    [InstructionEnum.SoceanMintBondedTokens]: {
      name: 'Mint Bonded Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanDepositToAuctionPool]: {
      name: 'Deposit to Auction',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanPurchaseBondedTokens]: {
      name: 'Purchase Bonded Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanCloseAuction]: {
      name: 'Close Auction',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanVest]: {
      name: 'Vest',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Socean,
    },
    [InstructionEnum.SoceanCancelVest]: {
      name: 'Cancel Vest',
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
    [InstructionEnum.SaberPoolsDeposit]: {
      name: 'Pool Deposit',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Saber,
    },
    [InstructionEnum.SaberPoolsWithdrawOne]: {
      name: 'Withdraw One From Pool',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Saber,
    },
    [InstructionEnum.SaberPoolsSwap]: {
      name: 'Swap',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Saber,
      tag: 'beta',
    },
    [InstructionEnum.SaberPeripheryRedeemAllTokensFromMintProxy]: {
      name: 'Redeem All Tokens From Mint Proxy',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Saber,
    },
    [InstructionEnum.UXDInitializeController]: {
      name: 'Initialize Controller',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDSetRedeemableGlobalSupplyCap]: {
      name: 'Set Redeemable Global Supply Cap',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'deprecated',
    },
    [InstructionEnum.UXDSetMangoDepositoriesRedeemableSoftCap]: {
      name: 'Set Mango Depositories Redeemable Supply Soft Cap',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'deprecated',
    },
    [InstructionEnum.UXDRegisterMangoDepository]: {
      name: 'Register Mango Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDDepositInsuranceToMangoDepository]: {
      name: 'Deposit Insurance To Mango Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDWithdrawInsuranceFromMangoDepository]: {
      name: 'Withdraw Insurance From Mango Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
    },
    [InstructionEnum.UXDDisableDepositoryMinting]: {
      name: 'Disable Depository Minting',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDQuoteMintWithMangoDepository]: {
      name: 'Quote Mint With Mango Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDQuoteRedeemWithMangoDepository]: {
      name: 'Quote Redeem With Mango Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDRegisterMercurialVaultDepository]: {
      name: 'Register Mercurial Vault Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDEditMercurialVaultDepository]: {
      name: 'Edit Mercurial Vault Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDEditController]: {
      name: 'Edit Controller',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDEditMangoDepository]: {
      name: 'Edit Mango Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDMintWithMercurialVaultDepository]: {
      name: 'Mint with Mercurial Vault Depository',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDSetMangoDepositoryQuoteMintAndRedeemFee]: {
      name: 'Set Mango Depository Quote Mint And Redeem Fee',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
    },
    [InstructionEnum.UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap]: {
      name: 'Set Mango Depository Quote Mint And Redeem Soft Cap',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXD,
      tag: 'beta',
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
    [InstructionEnum.FriktionWithdrawFromVolt]: {
      name: 'Withdraw from Volt',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Friktion,
      tag: 'beta',
    },
    [InstructionEnum.FriktionClaimWithdrawal]: {
      name: 'Claim Pending Withdrawal',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Friktion,
      tag: 'beta',
    },
    [InstructionEnum.Transfer]: {
      name: 'Transfer Tokens From Treasuries',
      isVisible: canUseTokenTransferInstruction,
      packageId: PackageEnum.Native,
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
          ownVoterWeight.canCreateProposal(g.account.config),
        )
      ),
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.UXDStakingMigrateStakingCampaignFromV1ToV2]: {
      name: 'Migrate Staking Campaign From v1 to v2',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXDStaking,
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
      name: 'Refill Reward Vault',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.UXDStaking,
    },
    [InstructionEnum.NativeTransferTokensForm]: {
      name: 'Transfer Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.DeltafiCreateLiquidityProvider]: {
      name: 'Create Liquidity Provider',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Deltafi,
    },
    [InstructionEnum.DeltafiPoolDeposit]: {
      name: 'Deposit Tokens to Pool',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Deltafi,
    },
    [InstructionEnum.DeltafiPoolWithdraw]: {
      name: 'Withdraw Tokens from Pool',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Deltafi,
    },
    [InstructionEnum.DeltafiCreateFarmUser]: {
      name: 'Create Farm User',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Deltafi,
    },
    [InstructionEnum.DeltafiFarmDeposit]: {
      name: 'Deposit Tokens to Farm',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Deltafi,
    },
    [InstructionEnum.DeltafiFarmWithdraw]: {
      name: 'Withdraw Tokens from Farm',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Deltafi,
    },
    [InstructionEnum.DeltafiClaimFarmRewards]: {
      name: 'Claim Farm Rewards',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Deltafi,
      tag: 'beta',
    },
    [InstructionEnum.NativeBurnSplTokens]: {
      name: 'Burn SPL Tokens',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.OrcaWhirlpoolOpenPosition]: {
      name: 'Orca Whirlpool Open Position',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Orca,
    },
    [InstructionEnum.OrcaWhirlpoolIncreaseLiquidity]: {
      name: 'Orca Whirlpool Increase Liquidity',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Orca,
    },
    [InstructionEnum.OrcaWhirlpoolUpdateFeesAndRewards]: {
      name: 'Orca Whirlpool Update Fees and Rewards',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Orca,
    },
    [InstructionEnum.OrcaWhirlpoolCollectFees]: {
      name: 'Orca Whirlpool Collect Fees',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Orca,
    },
    [InstructionEnum.OrcaWhirlpoolDecreaseLiquidity]: {
      name: 'Orca Whirlpool Decrease Liquidity',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Orca,
    },
    [InstructionEnum.OrcaWhirlpoolClosePosition]: {
      name: 'Orca Whirlpool Close Position',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Orca,
    },
    [InstructionEnum.OrcaWhirlpoolSwap]: {
      name: 'Orca Whirlpool Swap',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Orca,
    },
    [InstructionEnum.MercurialPoolDeposit]: {
      name: 'Mercurial Pool Deposit',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Mercurial,
    },
    [InstructionEnum.MercurialPoolWithdraw]: {
      name: 'Mercurial Pool Withdraw',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Mercurial,
    },
    [InstructionEnum.NativeIncreaseComputingBudget]: {
      name: 'Increase Computing Budget',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Native,
    },
    [InstructionEnum.CredixDeposit]: {
      name: 'Deposit',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Credix,
    },
    [InstructionEnum.CredixWithdraw]: {
      name: 'Withdraw',
      isVisible: canUseAnyInstruction,
      packageId: PackageEnum.Credix,
    },
  };

  const availableInstructions = Object.entries(instructions)
    .filter(
      ([, { isVisible }]) => typeof isVisible === 'undefined' || isVisible,
    )
    .map(([id, { name, packageId, tag }]) => ({
      id: Number(id) as InstructionEnum,
      name,
      packageId,
      tag,
    }));

  const availablePackages: PackageType[] = Object.entries(packages).map(
    ([id, infos]) => ({
      id: Number(id) as PackageEnum,
      ...infos,
    }),
  );

  const getPackageTypeById = (packageId: PackageEnum) => {
    return availablePackages.find(
      (availablePackage) => availablePackage.id === packageId,
    );
  };

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
  };
}
