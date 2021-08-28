import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js'

export interface EndpointInfo {
  name: string
  url: string
}

export interface RealmInfo {
  symbol: string
  endpoint: string
  programId: PublicKey
  realmId: PublicKey
}

export interface TokenAccount {
  pubkey: PublicKey
  account: AccountInfo<Buffer> | null
  effectiveMint: PublicKey
}

export interface WalletAdapter {
  publicKey: PublicKey
  autoApprove: boolean
  connected: boolean
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
  connect: () => any
  disconnect: () => any
  on(event: string, fn: () => void): this
}
