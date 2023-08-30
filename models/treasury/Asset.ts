import type { BigNumber } from 'bignumber.js'
import type {
  GoverningTokenConfig,
  MintMaxVoteWeightSource,
} from '@solana/spl-governance'

import type { AssetAccount, StakeState } from '@utils/uiTypes/assets'

import { NFT } from './NFT'
import { Program } from './Program'
import { Domain } from './Domain'

import { PublicKey } from '@solana/web3.js'

export enum AssetType {
  Mint,
  NFTCollection,
  Domain,
  Programs,
  RealmAuthority,
  Sol,
  Token,
  Unknown,
  TokenOwnerRecordAsset,
  Stake,
}

export interface Mint {
  type: AssetType.Mint
  address: string
  id: string
  name: string
  raw: AssetAccount
  symbol: string
  tokenRole?: 'council' | 'community'
  totalSupply?: BigNumber
}

export interface NFTCollection {
  type: AssetType.NFTCollection
  address?: string
  id: string
  count: BigNumber
  icon: JSX.Element
  list: NFT[]
  name: string
  totalCount?: BigNumber
}

export interface Programs {
  type: AssetType.Programs
  id: string
  count: BigNumber
  list: Program[]
}

export interface RealmAuthority {
  type: AssetType.RealmAuthority
  id: string
  address: string
  config: {
    communityMintMaxVoteWeightSource?: MintMaxVoteWeightSource
    minCommunityTokensToCreateGovernance: BigNumber
    communityTokenConfig?: GoverningTokenConfig
    councilTokenConfig?: GoverningTokenConfig
  }
  icon: JSX.Element
  name: string
}

export interface Sol {
  type: AssetType.Sol
  address: string
  id: string
  count: BigNumber
  icon: JSX.Element
  price?: BigNumber
  raw: AssetAccount
  value: BigNumber
}

export interface Token {
  type: AssetType.Token
  address: string
  id: string
  count: BigNumber
  icon: JSX.Element
  logo?: string
  mintAddress?: string
  name: string
  price?: BigNumber
  raw: AssetAccount
  symbol: string
  value: BigNumber
}

export interface Stake {
  type: AssetType.Stake
  pubkey: PublicKey
  amount: number
  id: string
  state: StakeState
  raw: AssetAccount
  value: BigNumber
}

export interface Unknown {
  type: AssetType.Unknown
  address: string
  icon?: JSX.Element
  id: string
  count: BigNumber
  name: string
}

export interface Domains {
  type: AssetType.Domain
  id: string
  count: BigNumber
  list: Domain[]
}

export type Asset =
  | Mint
  | NFTCollection
  | Domains
  | Programs
  | RealmAuthority
  | Sol
  | Token
  | Unknown
  | Stake
