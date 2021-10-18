import { Governance, InstructionData } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { RpcContext } from '@models/core/api'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

export interface Instruction {
  serializedInstruction: string
  isValid: boolean
  sourceAccount: ParsedAccount<Governance> | undefined
}
export interface Form {
  destinationAccount: string
  amount: number
  sourceAccount: ParsedAccount<Governance> | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}
export interface SplTokenTransferRef {
  getSerializedInstruction: GetSerializedInstruction
}

interface GetSerializedInstruction {
  (): Promise<Instruction>
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
  instructionsData: InstructionData[]
]
