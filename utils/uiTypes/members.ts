import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

export interface Member {
  walletAddress: string
  votesCasted: number
  councilVotes: BN
  communityVotes: BN
  hasCouncilTokenOutsideRealm?: boolean
  hasCommunityTokenOutsideRealm?: boolean
  delegateWalletCouncil?: PublicKey
  delegateWalletCommunity?: PublicKey
}

export interface Delegate {
  communityMembers?: Array<Member>
  councilMembers?: Array<Member>
  communityTokenCount?: BN
  councilTokenCount?: BN
}

export interface Delegates {
  [key: string]: Delegate
}
