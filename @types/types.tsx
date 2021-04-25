import {
  AccountInfo,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import Wallet from '@project-serum/sol-wallet-adapter'

export interface ConnectionContextValues {
  endpoint: string
  setEndpoint: (newEndpoint: string) => void
  connection: Connection
  sendConnection: Connection
  availableEndpoints: EndpointInfo[]
  setCustomEndpoints: (newCustomEndpoints: EndpointInfo[]) => void
}

export interface EndpointInfo {
  name: string
  url: string
  websocket: string
}

export interface WalletContextValues {
  wallet: Wallet
  connected: boolean
  providerUrl: string
  setProviderUrl: (newProviderUrl: string) => void
  providerName: string
}

export interface TokenAccount {
  pubkey: PublicKey
  account: AccountInfo<Buffer> | null
  effectiveMint: PublicKey
}

/**
 * {tokenMint: preferred token account's base58 encoded public key}
 */
export interface SelectedTokenAccounts {
  [tokenMint: string]: string
}

// Token infos
export interface KnownToken {
  tokenSymbol: string
  tokenName: string
  icon?: string
  mintAddress: string
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
