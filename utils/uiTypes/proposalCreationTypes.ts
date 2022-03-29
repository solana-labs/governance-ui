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

export interface UiInstruction {
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
  governedAccount: GovernedMultiTypeAccount | undefined
  bufferAddress?: string
  bufferSpillAddress?: string
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>()

export interface SetProgramAuthorityForm {
  governedAccount: GovernedMultiTypeAccount | undefined
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
  governedAccount: GovernedMultiTypeAccount | undefined
  mintDecimals: number
}

export interface SetRedeemableGlobalSupplyCapForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  supplyCap: number
}

export interface SetMangoDepositoriesRedeemableSoftCapForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  softCap: number
}

export interface RegisterMangoDepositoryForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  collateralName?: string
  insuranceName?: string
}

export interface DepositInsuranceToMangoDepositoryForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  collateralName?: string
  insuranceName?: string
  insuranceDepositedAmount: number
}

export interface WithdrawInsuranceFromMangoDepositoryForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  collateralName?: string
  insuranceName?: string
  insuranceWithdrawnAmount: number
}

export enum Instructions {
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
  UXDInitializeController,
  UXDSetRedeemableGlobalSupplyCap,
  UXDSetMangoDepositoriesRedeemableSoftCap,
  UXDRegisterMangoDepository,
  UXDDepositInsuranceToMangoDepository,
  UXDWithdrawInsuranceFromMangoDepository,
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
  getInstruction?: () => Promise<UiInstruction>
  type: any
}
export interface InstructionsContext {
  instructionsData: ComponentInstructionData[]
  handleSetInstructions: (val, index) => void
  governance?: ProgramAccount<Governance> | null
  setGovernance: (val) => void
}
