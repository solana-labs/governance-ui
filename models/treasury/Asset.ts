import type { BigNumber } from 'bignumber.js'
import type { MintMaxVoteWeightSource } from '@solana/spl-governance'

import type { AssetAccount } from '@utils/uiTypes/assets'

import { NFT } from './NFT'
import { Program } from './Program'

export enum AssetType {
  Mint,
  NFTCollection,
  Programs,
  RealmAuthority,
  Sol,
  Token,
  Unknown,
}

export interface Mint {
  type: AssetType.Mint
  address: string
  id: string
  name: string
  raw: AssetAccount
  symbol: string
  tokenType?: 'council' | 'community'
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
    useCommunityVoterWeightAddin?: boolean
    useMaxCommunityVoterWeightAddin?: boolean
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

export interface Unknown {
  type: AssetType.Unknown
  address: string
  icon?: JSX.Element
  id: string
  count: BigNumber
  name: string
}

export type Asset =
  | Mint
  | NFTCollection
  | Programs
  | RealmAuthority
  | Sol
  | Token
  | Unknown
