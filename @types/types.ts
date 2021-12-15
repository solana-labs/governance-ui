import type { AccountInfo, PublicKey } from '@solana/web3.js'

export interface EndpointInfo {
  name: string
  url: string
}

export interface TokenAccount {
  pubkey: PublicKey
  account: AccountInfo<Buffer> | null
  effectiveMint: PublicKey
}
