import { Governance, InstructionData } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js'
import { getNameOf } from '@tools/core/script'
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  GovernedTokenAccount,
} from '@utils/tokens'
import { SupportedMintName } from '@tools/sdk/solend/configuration'
import { SplTokenUIName } from '@utils/splTokens'
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts'
import { LockupKind } from 'VoteStakeRegistry/tools/types'
import { AmountSide } from '@raydium-io/raydium-sdk'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'
import { InstructionType } from '@hooks/useGovernanceAssets'

export interface FormInstructionData {
  serializedInstruction: string
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
  governedTokenAccount: GovernedTokenAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface FriktionDepositForm {
  amount: number | undefined
  governedTokenAccount: GovernedTokenAccount | undefined
  voltVaultId: string
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface GrantForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: GovernedTokenAccount | undefined
  mintInfo: MintInfo | undefined
  lockupKind: LockupKind
  startDateUnixSeconds: number
  periods: number
  allowClawback: boolean
}

export interface ClawbackForm {
  governedTokenAccount: GovernedTokenAccount | undefined
  voter: Voter | null
  deposit: DepositWithMintAccount | null
}

export interface SendTokenCompactViewForm extends SplTokenTransferForm {
  description: string
  title: string
}

export interface StakingViewForm {
  destinationAccount: GovernedTokenAccount | undefined
  amount: number | undefined
  governedTokenAccount: GovernedTokenAccount | undefined
  description: string
  title: string
}

export interface MintForm {
  destinationAccount: string
  amount: number | undefined
  mintAccount: GovernedMintInfoAccount | undefined
  programId: string | undefined
}

export interface ProgramUpgradeForm {
  governedAccount?: GovernedMultiTypeAccount
  bufferAddress?: string
  bufferSpillAddress?: string
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>()

export interface SetProgramAuthorityForm {
  governedAccount?: GovernedMultiTypeAccount
  destinationAuthority?: string
}
export interface Base64InstructionForm {
  governedAccount?: GovernedMultiTypeAccount
  base64: string
  holdUpTime: number
}

export interface EmptyInstructionForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface CreateAssociatedTokenAccountForm {
  governedAccount?: GovernedMultiTypeAccount
  splTokenMintUIName?: SplTokenUIName
}

export interface CreateSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface InitSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface DepositReserveLiquidityAndObligationCollateralForm {
  governedAccount?: GovernedMultiTypeAccount
  uiAmount: number
  mintName?: SupportedMintName
}

export interface WithdrawObligationCollateralAndRedeemReserveLiquidityForm {
  governedAccount?: GovernedMultiTypeAccount
  uiAmount: number
  mintName?: SupportedMintName
  destinationLiquidity?: string
}

export interface RefreshObligationForm {
  governedAccount?: GovernedMultiTypeAccount
  mintName?: SupportedMintName
}

export interface RefreshReserveForm {
  governedAccount?: GovernedMultiTypeAccount
  mintName?: SupportedMintName
}

export interface AddLiquidityRaydiumForm {
  governedAccount?: GovernedMultiTypeAccount
  liquidityPool?: string
  baseAmountIn?: number
  quoteAmountIn?: number
  fixedSide: AmountSide
  slippage: number
}

export interface RemoveLiquidityRaydiumForm {
  governedAccount?: GovernedMultiTypeAccount
  liquidityPool: string
  amountIn: number
}

export interface InitializeControllerForm {
  governedAccount?: GovernedMultiTypeAccount
  mintDecimals: number
}

export interface SetRedeemableGlobalSupplyCapForm {
  governedAccount?: GovernedMultiTypeAccount
  supplyCap: number
}

export interface SetMangoDepositoriesRedeemableSoftCapForm {
  governedAccount?: GovernedMultiTypeAccount
  softCap: number
}

export interface RegisterMangoDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount
  collateralName?: string
  insuranceName?: string
}

export interface DepositInsuranceToMangoDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount
  collateralName?: string
  insuranceName?: string
  insuranceDepositedAmount: number
}

export interface WithdrawInsuranceFromMangoDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount
  collateralName?: string
  insuranceName?: string
  insuranceWithdrawnAmount: number
}

export interface TribecaCreateEpochGaugeForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
}

export interface TribecaCreateEscrowGovernanceTokenATAForm {
  governedAccount?: GovernedMultiTypeAccount
  tribecaConfiguration: ATribecaConfiguration | null
}

export interface TribecaCreateGaugeVoteForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
}

export interface TribecaCreateGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount
  tribecaConfiguration: ATribecaConfiguration | null
}

export interface TribecaGaugeCommitVoteForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
}

export interface TribecaGaugeRevertVoteForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
}

export interface TribecaLockForm {
  governedAccount?: GovernedMultiTypeAccount
  tribecaConfiguration: ATribecaConfiguration | null
  uiAmount: number
  durationSeconds: number
}

export interface TribecaNewEscrowForm {
  governedAccount?: GovernedMultiTypeAccount
  tribecaConfiguration: ATribecaConfiguration | null
}

export interface TribecaPrepareEpochGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount
  tribecaConfiguration: ATribecaConfiguration | null
}

export interface TribecaResetEpochGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount
  tribecaConfiguration: ATribecaConfiguration | null
}

export interface TribecaGaugeSetVoteForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
  weight?: number
}

export enum InstructionEnum {
  Transfer,
  ProgramUpgrade,
  SetProgramAuthority,
  Mint,
  Base64,
  None,
  Grant,
  Clawback,
  CreateAssociatedTokenAccount,
  FriktionDepositIntoVolt,
  RaydiumAddLiquidity,
  RaydiumRemoveLiquidity,
  SolendCreateObligationAccount,
  SolendInitObligationAccount,
  SolendDepositReserveLiquidityAndObligationCollateral,
  SolendWithdrawObligationCollateralAndRedeemReserveLiquidity,
  SolendRefreshObligation,
  SolendRefreshReserve,
  TribecaCreateEpochGauge,
  TribecaCreateEscrowGovernanceTokenATA,
  TribecaCreateGaugeVote,
  TribecaCreateGaugeVoter,
  TribecaGaugeCommitVote,
  TribecaGaugeRevertVote,
  TribecaLock,
  TribecaNewEscrow,
  TribecaPrepareEpochGaugeVoter,
  TribecaResetEpochGaugeVoter,
  TribecaGaugeSetVote,
  UXDInitializeController,
  UXDSetRedeemableGlobalSupplyCap,
  UXDSetMangoDepositoriesRedeemableSoftCap,
  UXDRegisterMangoDepository,
  UXDDepositInsuranceToMangoDepository,
  UXDWithdrawInsuranceFromMangoDepository,
}

export enum PackageEnum {
  Native,
  VoteStakeRegistry,
  Solend,
  Raydium,
  UXD,
  Friktion,
  Tribeca,
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
  governedAccount?: ProgramAccount<Governance>
  getInstruction?: () => Promise<FormInstructionData>
  type?: InstructionType
}

export interface InstructionsContext {
  instructions: ComponentInstructionData[]
  handleSetInstruction: (
    val: Partial<ComponentInstructionData>,
    idx: number
  ) => void
}
