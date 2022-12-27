import { Governance, InstructionData } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js'
import { getNameOf } from '@tools/core/script'
import { SupportedMintName } from '@tools/sdk/solend/configuration'
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts'
import { LockupKind } from 'VoteStakeRegistry/tools/types'
import { consts as foresightConsts } from '@foresight-tmp/foresight-sdk'
import { AssetAccount, StakeAccount } from '@utils/uiTypes/assets'
import { RealmInfo } from '@models/registry/api'
import * as Msp from '@mean-dao/msp'

// Alphabetical order
export enum PackageEnum {
  // Castle = 1,
  Common,
  // Everlend,
  // Foresight,
  // Friktion,
  // GatewayPlugin,
  // GoblinGold,
  // Identity,
  // NftPlugin,
  // MangoMarketV3,
  // MangoMarketV4,
  // MeanFinance,
  // Serum,
  // Solend,
  // Streamflow,
  // Switchboard,
  // VsrPlugin,
  // Dual,
}

export interface UiInstruction {
  serializedInstruction: string
  additionalSerializedInstructions?: string[]
  isValid: boolean
  governance: ProgramAccount<Governance> | undefined
  customHoldUpTime?: number
  prerequisiteInstructions?: TransactionInstruction[]
  chunkSplitByDefault?: boolean
  prerequisiteInstructionsSigners?: Keypair[]
  chunkBy?: number
  signers?: Keypair[]
  shouldSplitIntoSeparateTxs?: boolean | undefined
}

export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface DomainNameTransferForm {
  destinationAccount: string
  governedAccount: AssetAccount | undefined
  domainAddress: string | undefined
}

export interface CastleDepositForm {
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  castleVaultId: string
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface CastleWithdrawForm {
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  castleVaultId: string
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface MeanCreateAccount {
  governedTokenAccount: AssetAccount | undefined
  label: string | undefined
  mintInfo: MintInfo | undefined
  amount: number | undefined
  type: Msp.TreasuryType
}

export interface MeanFundAccount {
  governedTokenAccount: AssetAccount | undefined
  mintInfo: MintInfo | undefined
  amount: number | undefined
  treasury: Msp.Treasury | undefined
}

export interface MeanWithdrawFromAccount {
  governedTokenAccount: AssetAccount | undefined
  mintInfo: MintInfo | undefined
  amount: number | undefined
  treasury: Msp.Treasury | undefined
  destination: string | undefined
}

export interface MeanCreateStream {
  governedTokenAccount: AssetAccount | undefined
  treasury: Msp.Treasury | undefined
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
  stream: Msp.Stream | undefined
  destination: string | undefined
}

export interface FriktionDepositForm {
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  voltVaultId: string
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface FriktionWithdrawForm {
  amount: number | undefined
  governedTokenAccount: AssetAccount | undefined
  voltVaultId: string
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface FriktionClaimPendingDepositForm {
  governedTokenAccount: AssetAccount | undefined
  voltVaultId: string
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface FriktionClaimPendingWithdrawForm {
  governedTokenAccount: AssetAccount | undefined
  voltVaultId: string
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface GoblinGoldDepositForm {
  amount: number | undefined
  governedTokenAccount?: AssetAccount | undefined
  goblinGoldVaultId: string
  mintName?: SupportedMintName | undefined
  mintInfo: MintInfo | undefined
}

export interface GoblinGoldWithdrawForm {
  amount: number | undefined
  governedTokenAccount?: AssetAccount | undefined
  goblinGoldVaultId?: string
  mintName?: SupportedMintName
  mintInfo: MintInfo | undefined
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
}

export interface SendTokenCompactViewForm extends SplTokenTransferForm {
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

export interface CreateStreamForm {
  recipient: string
  tokenAccount?: AssetAccount
  start: string
  depositedAmount: number
  releaseAmount: number
  amountAtCliff: number
  cancelable: boolean
  period: number
}

export interface CancelStreamForm {
  recipient: string
  strmMetadata: string
  tokenAccount?: AssetAccount
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

export interface MangoMakeSetMarketModeForm {
  governedAccount: AssetAccount | null
  mangoGroup: NameValue | null
  marketIndex: NameValue | null
  marketMode: NameValue | null
  marketType: NameValue | null
  adminPk: string
}

export interface MangoSwapSpotMarketForm {
  governedAccount: AssetAccount | null
  mangoGroup: NameValue | null
  market: NameValue | null
  adminPk: string
  newSpotMarketPk: string
}

export interface MangoRemoveOracleForm {
  governedAccount: AssetAccount | null
  mangoGroup: NameValue | null
  adminPk: string
  oraclePk: NameValue | null
}

export interface SagaPhoneForm {
  governedAccount: AssetAccount | null
  quantity: number
}

export interface MangoRemovePerpMarketForm {
  governedAccount: AssetAccount | null
  mangoGroup: NameValue | null
  marketPk: NameValue | null
  adminPk: string
  mngoDaoVaultPk: string
}

export interface MangoDepositToMangoAccountForm {
  governedAccount: AssetAccount | null
  amount: number
  mangoAccountPk: string
}

export interface MangoDepositToMangoAccountFormCsv {
  governedAccount: AssetAccount | null
  data: any[]
}

export interface MangoRemoveSpotMarketForm {
  governedAccount: AssetAccount | null
  mangoGroup: NameValue | null
  marketIndex: NameValue | null
  adminPk: string
  adminVaultPk: string
}

export interface MangoMakeAddSpotMarketForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  oracleAccount: string | undefined
  serumAccount: string | undefined
  maintLeverage: number
  initLeverage: number
  liquidationFee: number
  optUtil: number
  optRate: number
  maxRate: number
}

export interface MangoMakeChangeSpotMarketForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  baseSymbol: string | undefined
  maintLeverage: number | undefined
  initLeverage: number | undefined
  liquidationFee: number | undefined
  optUtil: number
  optRate: number
  maxRate: number
  version: string | undefined
}

export interface MangoMakeChangePerpMarketForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  perpMarket: string | undefined
  mngoPerPeriod: string | undefined
  maxDepthBps: string | undefined
  lmSizeShift: string | undefined
  makerFee: string | undefined
  takerFee: string | undefined
  maintLeverage: string | undefined
  initLeverage: string | undefined
  liquidationFee: string | undefined
  rate: string | undefined
  exp: string | undefined
  targetPeriodLength: string | undefined
  version: string | undefined
}

export interface MangoMakeCreatePerpMarketForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  oracleAccount: string | undefined
  baseDecimals: number
  baseLotSize: number
  quoteLotSize: number
  mngoPerPeriod: number
  maxDepthBps: number
  lmSizeShift: number
  makerFee: number
  takerFee: number
  maintLeverage: number
  initLeverage: number
  liquidationFee: number
  rate: number
  exp: number
  targetPeriodLength: number
  version: number
}
export interface MangoMakeChangeMaxAccountsForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  maxMangoAccounts: number
}
export interface MangoMakeChangeReferralFeeParams {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  refSurchargeCentibps: number
  refShareCentibps: number
  refMngoRequired: number
}

export interface MangoMakeChangeReferralFeeParams2 {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  refSurchargeCentibps: number
  refShareCentibps: number
  refMngoRequired: number
  refSurchargeCentibps2: number
  refShareCentibps2: number
  refMngoRequired2: number
}

export interface ForesightHasGovernedAccount {
  governedAccount: AssetAccount
}

export interface ForesightHasMarketListId extends ForesightHasGovernedAccount {
  marketListId: string
}

export interface ForesightHasMarketId extends ForesightHasMarketListId {
  marketId: number
}

export interface ForesightHasCategoryId extends ForesightHasGovernedAccount {
  categoryId: string
}

export interface ForesightMakeAddMarketListToCategoryParams
  extends ForesightHasCategoryId,
  ForesightHasMarketListId { }

export interface ForesightMakeResolveMarketParams extends ForesightHasMarketId {
  winner: number
}

export interface ForesightMakeSetMarketMetadataParams
  extends ForesightHasMarketId {
  content: string
  field: foresightConsts.MarketMetadataFieldName
}
export interface Base64InstructionForm {
  governedAccount: AssetAccount | undefined
  base64: string
  holdUpTime: number
}

export interface EmptyInstructionForm {
  governedAccount: AssetAccount | undefined
}

export interface SwitchboardAdmitOracleForm {
  oraclePubkey: PublicKey | undefined
  queuePubkey: PublicKey | undefined
}

export interface SwitchboardRevokeOracleForm {
  oraclePubkey: PublicKey | undefined
  queuePubkey: PublicKey | undefined
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
  // ChangeMakeDonation,
  // ClaimMangoTokens,
  // ClaimPendingDeposit,
  // ClaimPendingWithdraw,
  // Clawback,
  CloseTokenAccount,
  // ConfigureGatewayPlugin,
  // ConfigureNftPluginCollection,
  CreateAssociatedTokenAccount,
  // CreateGatewayPluginRegistrar,
  // CreateNftPluginMaxVoterWeight,
  // CreateNftPluginRegistrar,
  // CreateSolendObligationAccount,
  CreateTokenMetadata,
  // CreateVsrRegistrar,
  DeactivateValidatorStake,
  // DepositIntoCastle,
  // DepositIntoGoblinGold,
  // DepositIntoVolt,
  // DepositReserveLiquidityAndObligationCollateral,
  // DepositToMangoAccount,
  // DepositToMangoAccountCsv,
  // DifferValidatorStake,
  // DualFinanceExercise,
  // DualFinanceStakingOption,
  // DualFinanceWithdraw,
  // EverlendDeposit,
  // EverlendWithdraw,
  // ForesightAddMarketListToCategory,
  // ForesightInitCategory,
  // ForesightInitMarket,
  // ForesightInitMarketList,
  // ForesightResolveMarket,
  // ForesightSetMarketMetadata,
  // Grant,
  // InitSolendObligationAccount,
  // JoinDAO,
  // MangoAddOracle,
  // MangoAddSpotMarket,
  // MangoChangeMaxAccounts,
  // MangoChangePerpMarket,
  // MangoChangeQuoteParams,
  // MangoChangeReferralFeeParams,
  // MangoChangeReferralFeeParams2,
  // MangoChangeSpotMarket,
  // MangoCreatePerpMarket,
  // MangoRemoveOracle,
  // MangoRemovePerpMarket,
  // MangoRemoveSpotMarket,
  // MangoSetMarketMode,
  // MangoSwapSpotMarket,
  // MangoV4PerpCreate,
  // MangoV4PerpEdit,
  // MangoV4Serum3RegisterMarket,
  // MangoV4TokenEdit,
  // MangoV4TokenRegister,
  // MangoV4TokenRegisterTrustless,
  // MeanCreateAccount,
  // MeanCreateStream,
  // MeanFundAccount,
  // MeanTransferStream,
  // MeanWithdrawFromAccount,
  Mint,
  None,
  ProgramUpgrade,
  RealmConfig,
  // RefreshSolendObligation,
  // RefreshSolendReserve,
  // SagaPreOrder,
  // SerumGrantLockedMSRM,
  // SerumGrantLockedSRM,
  // SerumGrantVestMSRM,
  // SerumGrantVestSRM,
  // SerumInitUser,
  // SerumUpdateGovConfigAuthority,
  // SerumUpdateGovConfigParams,
  StakeValidator,
  // SwitchboardAdmitOracle,
  // SwitchboardRevokeOracle,
  Transfer,
  TransferDomainName,
  UpdateTokenMetadata,
  // VotingMintConfig,
  // WithdrawFromCastle,
  // WithdrawFromGoblinGold,
  // WithdrawObligationCollateralAndRedeemReserveLiquidity,
  // WithdrawValidatorStake,
  // WithdrawFromVolt,
  // AddKeyToDID,
  // RemoveKeyFromDID,
  // AddServiceToDID,
  // RemoveServiceFromDID,
}

export type createParams = [
  rpc: RpcContext,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  holdUpTime: number,
  proposalIndex: number,
  instructionsData: InstructionData[],
  isDraft: boolean
]

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

export interface DualFinanceStakingOptionForm {
  strike: number
  soName: string | undefined
  optionExpirationUnixSeconds: number
  numTokens: number
  lotSize: number
  baseTreasury: AssetAccount | undefined
  quoteTreasury: AssetAccount | undefined
  payer: AssetAccount | undefined
  userPk: string | undefined
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
}
