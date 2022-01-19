import { Governance, InstructionData } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  GovernedProgramAccount,
  GovernedTokenAccount,
} from '@utils/tokens'

export interface UiInstruction {
  serializedInstruction: string
  isValid: boolean
  governance: ProgramAccount<Governance> | undefined
  customHoldUpTime?: number
  prerequisiteInstructions?: TransactionInstruction[]
}
export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: GovernedTokenAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface SendTokenCompactViewForm extends SplTokenTransferForm {
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
  governedAccount: GovernedProgramAccount | undefined
  programId: string | undefined
  bufferAddress: string
}

export interface ProgramAuthorityForm {
  governedAccount: GovernedProgramAccount | GovernedTokenAccount | undefined
  accountId: string | undefined
  destinationAuthority: string
}

export interface AddLiquidityRaydiumForm {
  governedAccount: GovernedTokenAccount | undefined
  baseTokenName: string
  quoteTokenName: string
  baseAmountIn: number
  quoteAmountIn: number
}

export interface MangoMakeChangeMaxAccountsForm {
  governedAccount: GovernedProgramAccount | undefined
  programId: string | undefined
  mangoGroupKey: string | undefined
  maxMangoAccounts: number
}

export interface Base64InstructionForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  base64: string
  holdUpTime: number
}

export interface EmptyInstructionForm {
  governedAccount: GovernedMultiTypeAccount | undefined
}

export enum Instructions {
  Transfer,
  ProgramUpgrade,
  SetProgramAuthority,
  Mint,
  Base64,
  None,
  AddLiquidityRaydium,
  InitializeController,
  SetRedeemableGlobalSupplyCap,
  SetMangoDepositoriesRedeemableSoftCap,
  RegisterMangoDepository,
  DepositInsuranceToMangoDepository,
  WithdrawInsuranceFromMangoDepository,
  MangoMakeChangeMaxAccounts,
}

export interface InitializeControllerForm {
  governedAccount: GovernedProgramAccount | undefined
  mintDecimals: number
  programId: string | undefined
}

export interface SetRedeemableGlobalSupplyCapForm {
  governedAccount: GovernedProgramAccount | undefined
  supplyCap: number
  programId: string | undefined
}

export interface SetMangoDepositoriesRedeemableSoftCapForm {
  governedAccount: GovernedProgramAccount | undefined
  softCap: number
  programId: string | undefined
}

export interface RegisterMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralName: string
  insuranceName: string
  programId: string | undefined
}

export interface DepositInsuranceToMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralName: string
  insuranceName: string
  insuranceDepositedAmount: number
  programId: string | undefined
}

export interface WithdrawInsuranceFromMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralName: string
  insuranceName: string
  insuranceWithdrawnAmount: number
  programId: string | undefined
}

export enum UXDIntructions {
  InitializeController,
  SetRedeemableGlobalSupplyCap,
  SetMangoDepositoriesRedeemableSoftCap,
  RegisterMangoDepository,
  DepositInsuranceToMangoDepository,
  WithdrawInsuranceFromMangoDepository,
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
