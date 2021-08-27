import { PublicKey, AccountInfo } from '@solana/web3.js'

export interface ParsedAccountBase {
  pubkey: PublicKey
  account: AccountInfo<Buffer>
  info: unknown
}

export interface ParsedAccount<T> extends ParsedAccountBase {
  info: T
}

// Interface for  accounts with type field
export interface ProgramAccountWithType {
  accountType: number
}
