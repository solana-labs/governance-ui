import { Governance, InstructionData } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { RpcContext } from '@models/core/api'
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
  governance: ParsedAccount<Governance> | undefined
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
  Mint,
  Base64,
  None,
  InitializeController,
  SetRedeemableGlobalSupplyCap,
  SetMangoDepositoriesRedeemableSoftCap,
  RegisterMangoDepository,
  DepositInsuranceToMangoDepository,
  WithdrawInsuranceFromMangoDepository,
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
  controllerPda: string
}

export interface SetMangoDepositoriesRedeemableSoftCapForm {
  governedAccount: GovernedProgramAccount | undefined
  supplyCap: number
  programId: string | undefined
  controllerPda: string
}

export interface RegisterMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralMint: string
  insuranceMint: string
  programId: string | undefined
  controllerPda: string
}

export interface DepositInsuranceToMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralMint: string
  insuranceMint: string
  insuranceDepositedAmount: number
  programId: string | undefined
  controllerPda: string
}

export interface WithdrawInsuranceFromMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralMint: string
  insuranceMint: string
  insuranceWithdrawnAmount: number
  programId: string | undefined
  controllerPda: string
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
  governedAccount?: ParsedAccount<Governance> | undefined
  getInstruction?: () => Promise<UiInstruction>
  type: any
}
export interface InstructionsContext {
  instructionsData: ComponentInstructionData[]
  handleSetInstructions: (val, index) => void
  governance: ParsedAccount<Governance> | null | undefined
  setGovernance: (val) => void
}
