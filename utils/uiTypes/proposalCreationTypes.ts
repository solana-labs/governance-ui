import { Governance, InstructionData } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { RpcContext } from '@models/core/api'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { GovernedTokenAccount } from '@utils/tokens'

export interface Instruction {
  serializedInstruction: string
  isValid: boolean
  governedAccount: GovernedTokenAccount | undefined
}
export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number | undefined
  governedAccount: GovernedTokenAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface ProgramUpgradeForm {
  governedAccount: GovernedTokenAccount | undefined
  programId: string | undefined
  bufferAddress: string
}

export enum Instructions {
  Transfer,
  ProgramUpgrade,
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
  governedAccount?: GovernedTokenAccount | undefined
  getInstruction?: () => Promise<Instruction>
  type: any
}
export interface InstructionsContext {
  instructionsData: ComponentInstructionData[]
  handleSetInstructions: (val, index) => void
  governance: ParsedAccount<Governance> | null | undefined
  setGovernance: (val) => void
}
