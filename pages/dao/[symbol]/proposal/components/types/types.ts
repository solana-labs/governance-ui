import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { MintInfo } from '@solana/spl-token'

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
