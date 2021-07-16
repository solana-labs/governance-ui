import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js'

export interface EndpointInfo {
  name: string
  url: string
  websocket: string
  programId: string
  poolKey: string
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
