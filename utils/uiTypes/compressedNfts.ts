import { PublicKey } from '@metaplex-foundation/js'
import * as anchor from '@coral-xyz/anchor'

export interface Creator {
  address: PublicKey
  verified: boolean
  share: number
}

export interface Collection {
  key: PublicKey
  verified: boolean
}

export interface CompressedNftAsset {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  primarySaleHappened: boolean
  isMutable: boolean
  editionNonce?: number
  creators: Creator[]
  collection?: Collection
  root: null | number[]
  leafDelegate: PublicKey
  nonce: anchor.BN
  index: number
  proofLen: null | number
}
