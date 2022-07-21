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
  depositTokenMint: string | undefined
  programId: string | undefined
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
  releaseFrequency: number
  releaseAmount: number
  amountAtCliff: number
  cancelable: boolean
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>()

export interface MangoMakeAddOracleForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  mangoGroup: string | undefined
  oracleAccount: string | undefined
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
  maintLeverage: number
  initLeverage: number
  liquidationFee: number
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

export interface ForesightMakeAddMarketMetadataParams
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
  CreateStream,
  CancelStream,
  Grant,
  Clawback,
  CreateAssociatedTokenAccount,
  DepositIntoVolt,
  WithdrawFromVolt,
  CreateSolendObligationAccount,
  InitSolendObligationAccount,
  DepositReserveLiquidityAndObligationCollateral,
  WithdrawObligationCollateralAndRedeemReserveLiquidity,
  RefreshSolendObligation,
  RefreshSolendReserve,
  ForesightInitMarket,
  ForesightInitMarketList,
  ForesightInitCategory,
  ForesightResolveMarket,
  ForesightAddMarketListToCategory,
  ForesightAddMarketMetadata,
  RealmConfig,
  CreateNftPluginRegistrar,
  CreateNftPluginMaxVoterWeight,
  ConfigureNftPluginCollection,
  CloseTokenAccount,
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
