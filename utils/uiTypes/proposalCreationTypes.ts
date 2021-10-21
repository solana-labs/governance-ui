import { InstructionData } from '@models/accounts'
import { RpcContext } from '@models/core/api'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { GovernedTokenAccount } from '@utils/tokens'

export interface Instruction {
  serializedInstruction: string
  isValid: boolean
  governance: GovernedTokenAccount | undefined
}
export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number | undefined
  governance: GovernedTokenAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export enum Instructions {
  Transfer,
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
  governance?: GovernedTokenAccount | undefined
  getSerializedInstruction?: () => Promise<Instruction>
  type: any
}
export interface InstructionsContext {
  instructionsData: ComponentInstructionData[]
  handleSetInstructionData: (val, index) => void
}
