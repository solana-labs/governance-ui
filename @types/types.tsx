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
  website: string
  // Specifies the realm mainnet name for resource lookups
  // It's required for none mainnet environments when the realm name is different than on mainnet
  mainnetName?: string
  // Website keywords
  keywords?: string
  // twitter:site meta
  twitter?: string
  // og:image
  ogImage?: string
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
