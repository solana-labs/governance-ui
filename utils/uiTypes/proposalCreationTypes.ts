import { Governance, InstructionData } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js'
import { getNameOf } from '@tools/core/script'
import { SupportedMintName } from '@tools/sdk/solend/configuration'
import { SplTokenUIName } from '@utils/splTokens'
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts'
import { LockupKind } from 'VoteStakeRegistry/tools/types'
import { consts as foresightConsts } from '@foresight-tmp/foresight-sdk'
import { AssetAccount } from '@utils/uiTypes/assets'

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

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>()

export interface MangoMakeAddOracleForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  oracleAccount: string | undefined
}

type NameValue = {
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

export interface MangoRemovePerpMarketForm {
  governedAccount: AssetAccount | null
  mangoGroup: NameValue | null
  marketPk: NameValue | null
  adminPk: string
  mngoDaoVaultPk: string
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
    ForesightHasMarketListId {}

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
  splTokenMintUIName?: SplTokenUIName
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

export enum Instructions {
  Transfer,
  ProgramUpgrade,
  Mint,
  Base64,
  None,
  MangoAddOracle,
  MangoAddSpotMarket,
  MangoChangeMaxAccounts,
  MangoChangePerpMarket,
  MangoChangeReferralFeeParams,
  MangoChangeSpotMarket,
  MangoCreatePerpMarket,
  MangoSetMarketMode,
  MangoChangeQuoteParams,
  MangoRemoveSpotMarket,
  MangoRemovePerpMarket,
  MangoSwapSpotMarket,
  Grant,
  Clawback,
  CreateAssociatedTokenAccount,
  DepositIntoVolt,
  WithdrawFromVolt,
  ClaimPendingDeposit,
  ClaimPendingWithdraw,
  DepositIntoCastle,
  WithrawFromCastle,
  DepositIntoGoblinGold,
  WithdrawFromGoblinGold,
  CreateSolendObligationAccount,
  InitSolendObligationAccount,
  DepositReserveLiquidityAndObligationCollateral,
  WithdrawObligationCollateralAndRedeemReserveLiquidity,
  SwitchboardAdmitOracle,
  SwitchboardRevokeOracle,
  RefreshSolendObligation,
  RefreshSolendReserve,
  ForesightInitMarket,
  ForesightInitMarketList,
  ForesightInitCategory,
  ForesightResolveMarket,
  ForesightAddMarketListToCategory,
  ForesightSetMarketMetadata,
  RealmConfig,
  CreateNftPluginRegistrar,
  CreateNftPluginMaxVoterWeight,
  ConfigureNftPluginCollection,
  CloseTokenAccount,
  VotingMintConfig,
  CreateVsrRegistrar,
  CreateGatewayPluginRegistrar,
  ConfigureGatewayPlugin,
  ChangeMakeDonation,
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
