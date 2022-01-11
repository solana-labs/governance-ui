import { PublicKey, AccountInfo } from '@solana/web3.js'

export interface ParsedAccountBase {
  pubkey: PublicKey
  data: AccountInfo<Buffer>
  account: unknown
}

export interface ParsedAccount<T> extends ParsedAccountBase {
  account: T
}

// Interface for  accounts with type field
export interface ProgramAccountWithType {
  accountType: number
}
