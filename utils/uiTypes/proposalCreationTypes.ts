import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js'
import { getNameOf } from '@tools/core/script'
import { SupportedMintName } from '@tools/sdk/solend/configuration'
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts'
import { LockupKind } from 'VoteStakeRegistry/tools/types'
import { AssetAccount, StakeAccount } from '@utils/uiTypes/assets'
import { RealmInfo } from '@models/registry/api'
import * as PaymentStreaming from '@mean-dao/payment-streaming'

// Alphabetical order
export enum PackageEnum {
  Common,
  Distribution,
  Dual,
  GatewayPlugin,
  Identity,
  MangoMarketV4,
  MeanFinance,
  NftPlugin,
  PsyFinance,
  Pyth,
  Serum,
  Solend,
  Symmetry,
  Squads,
  Switchboard,
  VsrPlugin,
}

export interface UiInstruction {
  serializedInstruction: string
  additionalSerializedInstructions?: string[]
  isValid: boolean
  governance: ProgramAccount<Governance> | undefined
  customHoldUpTime?: number
  prerequisiteInstructions?: TransactionInstruction[]
  prerequisiteInstructionsSigners?: (Keypair | null)[]
  chunkBy?: number
  signers?: Keypair[]
}

export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface BurnTokensForm {
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  mintInfo: MintInfo | undefined
}

export interface DomainNameTransferForm {
  destinationAccount: string
  governedAccount: AssetAccount | undefined
  domainAddress: string | undefined
}

export interface MeanCreateAccount {
  governedTokenAccount: AssetAccount | undefined
  label: string | undefined
  mintInfo: MintInfo | undefined
  amount: number | undefined
  type: PaymentStreaming.AccountType
}

export interface MeanFundAccount {
  governedTokenAccount: AssetAccount | undefined
  mintInfo: MintInfo | undefined
  amount: number | undefined
  paymentStreamingAccount: PaymentStreaming.PaymentStreamingAccount | undefined
}

export interface MeanWithdrawFromAccount {
  governedTokenAccount: AssetAccount | undefined
  mintInfo: MintInfo | undefined
  amount: number | undefined
  paymentStreamingAccount: PaymentStreaming.PaymentStreamingAccount | undefined
  destination: string | undefined
}

export interface MeanCreateStream {
  governedTokenAccount: AssetAccount | undefined
  paymentStreamingAccount: PaymentStreaming.PaymentStreamingAccount | undefined
  streamName: string | undefined
  destination: string | undefined
  mintInfo: MintInfo | undefined
  allocationAssigned: number | undefined
  rateAmount: number | undefined
  rateInterval: 0 | 1 | 2 | 3 | 4 | 5
  startDate: string
}

export interface MeanTransferStream {
  governedTokenAccount: AssetAccount | undefined
  stream: PaymentStreaming.Stream | undefined
  destination: string | undefined
}

export interface GrantForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  mintInfo: MintInfo | undefined
  lockupKind: LockupKind
  startDateUnixSeconds: number
  periods: number
  allowClawback: boolean
}

export interface ClawbackForm {
  governedTokenAccount: AssetAccount | undefined
  voter: Voter | null
  deposit: DepositWithMintAccount | null
  holdupTime: number
}

export interface SendTokenCompactViewForm extends Omit<SplTokenTransferForm, 'amount' | 'destinationAccount'> {
  destinationAccount: string[]
  amount: (number | undefined)[]
  txDollarAmount: (string | undefined)[]
  description: string
  title: string
}

export interface StakingViewForm {
  destinationAccount: AssetAccount | undefined
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  description: string
  title: string
}

export interface MintForm {
  destinationAccount: string
  amount: number | undefined
  mintAccount: AssetAccount | undefined
  programId: string | undefined
}

export interface ProgramUpgradeForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  bufferAddress: string
  bufferSpillAddress?: string | undefined
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>()

export interface MangoMakeAddOracleForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  oracleAccount: string | undefined
}

export type NameValue = {
  name: string
  value: string
}

/* PsyOptions American options */
export interface PsyFinanceMintAmericanOptionsForm {
  contractSize: number
  expirationUnixTimestamp: number
  optionTokenDestinationAccount: string
  quoteMint: string
  size: number | undefined
  strike: number
  underlyingAccount: AssetAccount | undefined
  underlyingMint: PublicKey | undefined
  writerTokenDestinationAccount: string
}

export interface PsyFinanceBurnWriterForQuote {
  size: number
  writerTokenAccount: AssetAccount | undefined
  quoteDestination: string
}

export interface PsyFinanceClaimUnderlyingPostExpiration {
  size: number
  writerTokenAccount: AssetAccount | undefined
  underlyingDestination: string
}

export interface PsyFinanceExerciseOption {
  size: number
  optionTokenAccount: AssetAccount | undefined
  quoteAssetAccount: AssetAccount | undefined
}

/* End PsyOptions American options */

export interface Base64InstructionForm {
  governedAccount: AssetAccount | undefined
  base64: string
  holdUpTime: number
}

export interface EmptyInstructionForm {
  governedAccount: AssetAccount | undefined
}

export interface CreateAssociatedTokenAccountForm {
  governedAccount?: AssetAccount
  splTokenMint?: string
}

export interface CreateSolendObligationAccountForm {
  governedAccount?: AssetAccount
}

export interface InitSolendObligationAccountForm {
  governedAccount?: AssetAccount
}

export interface DepositReserveLiquidityAndObligationCollateralForm {
  governedAccount?: AssetAccount
  uiAmount: string
  mintName?: SupportedMintName
}

export interface WithdrawObligationCollateralAndRedeemReserveLiquidityForm {
  governedAccount?: AssetAccount
  uiAmount: string
  mintName?: SupportedMintName
  destinationLiquidity?: string
}

export interface RefreshObligationForm {
  governedAccount?: AssetAccount
  mintName?: SupportedMintName
}

export interface RefreshReserveForm {
  governedAccount?: AssetAccount
  mintName?: SupportedMintName
}

export interface CreateTokenMetadataForm {
  name: string
  symbol: string
  uri: string
  mintAccount: AssetAccount | undefined
  programId: string | undefined
}

export interface UpdateTokenMetadataForm {
  name: string
  symbol: string
  uri: string
  mintAccount: AssetAccount | undefined
  programId: string | undefined
}

export interface SerumInitUserForm {
  governedAccount?: AssetAccount
  owner: string
  programId: string
}

export interface SerumGrantLockedForm {
  governedAccount?: AssetAccount
  owner: string
  mintInfo: MintInfo | undefined
  amount: number | undefined
  programId: string
}

export interface SerumUpdateConfigParam {
  governedAccount?: AssetAccount // Config Authority
  claimDelay?: number
  redeemDelay?: number
  cliffPeriod?: number
  linearVestingPeriod?: number
}

export interface SerumUpdateConfigAuthority {
  governedAccount?: AssetAccount // Config Authority
  newAuthority?: string
}

export interface JoinDAOForm {
  governedAccount?: AssetAccount
  mintInfo: MintInfo | undefined
  realm: RealmInfo | null
  amount?: number
}

export enum Instructions {
  Base64,
  Burn,
  ChangeMakeDonation,
  Clawback,
  CloseTokenAccount,
  CloseMultipleTokenAccounts,
  ConfigureGatewayPlugin,
  ConfigureNftPluginCollection,
  CreateAssociatedTokenAccount,
  CreateGatewayPluginRegistrar,
  CreateNftPluginMaxVoterWeight,
  CreateNftPluginRegistrar,
  CreateSolendObligationAccount,
  CreateTokenMetadata,
  CreateVsrRegistrar,
  DeactivateValidatorStake,
  DepositReserveLiquidityAndObligationCollateral,
  DifferValidatorStake,
  DualFinanceAirdrop,
  DualFinanceExerciseStakingOption,
  DualFinanceLiquidityStakingOption,
  DualFinanceInitStrike,
  DualFinanceStakingOption,
  DualFinanceGso,
  DualFinanceGsoWithdraw,
  DualFinanceStakingOptionWithdraw,
  DualFinanceDelegate,
  DualFinanceDelegateWithdraw,
  DualFinanceVoteDeposit,
  DaoVote,
  DistributionCloseVaults,
  DistributionFillVaults,
  DelegateStake,
  RemoveStakeLock,
  Grant,
  InitSolendObligationAccount,
  JoinDAO,
  MangoV4PerpCreate,
  MangoV4PerpEdit,
  MangoV4OpenBookRegisterMarket,
  MangoV4OpenBookEditMarket,
  MangoV4TokenEdit,
  MangoV4TokenRegister,
  MangoV4TokenRegisterTrustless,
  MangoV4GroupEdit,
  IdlSetBuffer,
  MangoV4IxGateSet,
  MangoV4AltSet,
  MangoV4AltExtend,
  MangoV4StubOracleCreate,
  MangoV4StubOracleSet,
  MangoV4TokenAddBank,
  MangoV4AdminWithdrawTokenFees,
  MangoV4WithdrawPerpFees,
  MeanCreateAccount,
  MeanCreateStream,
  MeanFundAccount,
  MeanTransferStream,
  MeanWithdrawFromAccount,
  Mint,
  None,
  ProgramUpgrade,
  PsyFinanceBurnWriterForQuote,
  PsyFinanceClaimUnderlyingPostExpiration,
  PsyFinanceExerciseOption,
  PsyFinanceMintAmericanOptions,
  RealmConfig,
  RefreshSolendObligation,
  RefreshSolendReserve,
  SerumGrantLockedMSRM,
  SerumGrantLockedSRM,
  SerumGrantVestMSRM,
  SerumGrantVestSRM,
  SerumInitUser,
  SerumUpdateGovConfigAuthority,
  SerumUpdateGovConfigParams,
  SquadsMeshAddMember,
  SquadsMeshChangeThresholdMember,
  SquadsMeshRemoveMember,
  PythRecoverAccount,
  PythUpdatePoolAuthority,
  StakeValidator,
  SwitchboardFundOracle,
  WithdrawFromOracle,
  Transfer,
  TransferDomainName,
  UpdateTokenMetadata,
  VotingMintConfig,
  WithdrawObligationCollateralAndRedeemReserveLiquidity,
  WithdrawValidatorStake,
  SplitStake,
  AddKeyToDID,
  RemoveKeyFromDID,
  AddServiceToDID,
  RemoveServiceFromDID,
  RevokeGoverningTokens,
  SetMintAuthority,
  SanctumDepositStake,
  SanctumWithdrawStake,
  SymmetryCreateBasket,
  SymmetryEditBasket,
  SymmetryDeposit,
  SymmetryWithdraw
}

export interface ComponentInstructionData {
  governedAccount?: ProgramAccount<Governance> | undefined
  getInstruction?: () => Promise<UiInstruction>
  type: any
}
export interface InstructionsContext {
  instructionsData: ComponentInstructionData[]
  voteByCouncil?: boolean | null
  handleSetInstructions: (val, index) => void
  governance: ProgramAccount<Governance> | null | undefined
  setGovernance: (val) => void
}

export interface ChangeNonprofit {
  name: string
  description: string
  ein: string
  classification: string
  category: string
  address_line: string
  city: string
  state: string
  zip_code: string
  icon_url: string
  email?: string
  website: string
  socials: {
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
    youtube?: string
  }
  crypto: {
    solana_address: string
    ethereum_address: string
  }
}

export interface ValidatorStakingForm {
  governedTokenAccount: AssetAccount | undefined
  validatorVoteKey: string
  amount: number
  seed: number
}

export interface ValidatorDeactivateStakeForm {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
}

export interface ValidatorWithdrawStakeForm {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
  amount: number
}

export interface ValidatorRemoveLockup {
  governedTokenAccount: AssetAccount | undefined
  stakeAccount: string
}

export interface DelegateStakeForm {
  governedTokenAccount: AssetAccount | undefined
  stakingAccount: StakeAccount | undefined
  votePubkey: string
}

export interface DualFinanceAirdropForm {
  root: string
  amount: number
  eligibilityStart: number
  eligibilityEnd: number
  amountPerVoter: number
  treasury: AssetAccount | undefined
}

export interface DualFinanceStakingOptionForm {
  strike: number
  soName: string | undefined
  optionExpirationUnixSeconds: number
  numTokens: string
  lotSize: number
  baseTreasury: AssetAccount | undefined
  quoteTreasury: AssetAccount | undefined
  payer: AssetAccount | undefined
  userPk: string | undefined
}

export interface DualFinanceGsoForm {
  strike: number
  soName: string | undefined
  optionExpirationUnixSeconds: number
  numTokens: number
  lotSize: number
  subscriptionPeriodEnd: number
  lockupRatio: number
  lockupMint: string
  baseTreasury: AssetAccount | undefined
  quoteTreasury: AssetAccount | undefined
  payer: AssetAccount | undefined
}

export interface DualFinanceLiquidityStakingOptionForm {
  optionExpirationUnixSeconds: number
  numTokens: number
  lotSize: number
  baseTreasury: AssetAccount | undefined
  quoteTreasury: AssetAccount | undefined
  payer: AssetAccount | undefined
}

export interface DualFinanceInitStrikeForm {
  strikes: string
  soName: string
  payer: AssetAccount | undefined
  baseTreasury: AssetAccount | undefined
}

export interface DualFinanceExerciseForm {
  numTokens: number
  soName: string | undefined
  baseTreasury: AssetAccount | undefined
  quoteTreasury: AssetAccount | undefined
  optionAccount: AssetAccount | undefined
}

export interface DualFinanceWithdrawForm {
  soName: string | undefined
  baseTreasury: AssetAccount | undefined
  mintPk: string | undefined
}

export interface DualFinanceGsoWithdrawForm {
  soName: string | undefined
  baseTreasury: AssetAccount | undefined
}

export interface DualFinanceDelegateForm {
  delegateAccount: string | undefined
  realm: string | undefined
  delegateToken: AssetAccount | undefined
}

export interface DualFinanceDelegateWithdrawForm {
  realm: string | undefined
  delegateToken: AssetAccount | undefined
}

export interface DualFinanceVoteDepositForm {
  numTokens: number
  realm: string | undefined
  delegateToken: AssetAccount | undefined
}

export interface SymmetryCreateBasketForm {
  governedAccount?: AssetAccount,
  basketType: number,
  basketName: string,
  basketSymbol: string,
  basketMetadataUrl: string,
  basketComposition: {
    name: string,
    symbol: string,
    token: PublicKey;
    weight: number;
  }[],
  rebalanceThreshold: number,
  rebalanceSlippageTolerance: number,
  depositFee: number,
  feeCollectorAddress:string,
  liquidityProvision: boolean,
  liquidityProvisionRange: number,
}


export interface SymmetryEditBasketForm {
  governedAccount?: AssetAccount,
  basketAddress?: PublicKey,
  basketType: number,
  basketName: string,
  basketSymbol: string,
  basketMetadataUrl: string,
  basketComposition: {
    name: string,
    symbol: string,
    token: PublicKey;
    weight: number;
  }[],
  rebalanceThreshold: number,
  rebalanceSlippageTolerance: number,
  depositFee: number,
  feeCollectorAddress:string,
  liquidityProvision: boolean,
  liquidityProvisionRange: number,
}

export interface SymmetryDepositForm {
  governedAccount?: AssetAccount,
  basketAddress?: PublicKey,
  depositToken?: PublicKey,
  depositAmount: number,
}

export interface SymmetryWithdrawForm {
  governedAccount?: AssetAccount,
  basketAddress?: PublicKey,
  withdrawAmount: number,
  withdrawType: number
}
