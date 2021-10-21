import { InstructionData } from '@models/accounts'
import { RpcContext } from '@models/core/api'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { TokenAccountWithMintInfo } from '@utils/tokens'

export interface Instruction {
  serializedInstruction: string
  isValid: boolean
  governance: TokenAccountWithMintInfo | undefined
}
export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number
  governance: TokenAccountWithMintInfo | undefined
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
  instructionsData: InstructionData[],
  isDraft: boolean
]
