import type { BigNumber } from 'bignumber.js'
import type {
  Governance,
  GoverningTokenConfig,
  MintMaxVoteWeightSource,
  ProgramAccount,
  Realm,
  TokenOwnerRecord,
} from '@solana/spl-governance'

import type { AssetAccount } from '@utils/uiTypes/assets'

import { NFT } from './NFT'
import { Program } from './Program'
import { Domain } from './Domain'

import { TokenProgramAccount } from '@utils/tokens'
import { MintInfo } from '@solana/spl-token'

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
  raw: AssetAccount
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

export interface TokenOwnerRecordAsset {
  type: AssetType.TokenOwnerRecordAsset
  id: string
  address: PublicKey
  owner: PublicKey
  realmId: string
  realmSymbol: string
  displayName: string
  programId: string
  realmImage?: string
  communityMint: TokenProgramAccount<MintInfo>
  realmAccount: ProgramAccount<Realm>
  tokenOwnerRecordAccount: ProgramAccount<TokenOwnerRecord>
  governanceOwner: ProgramAccount<Governance>
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
  | TokenOwnerRecordAsset
  | Stake
