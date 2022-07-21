import { BN } from '@project-serum/anchor'
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
  communityTokenCount?: number
  councilTokenCount?: number
}

export interface Delegates {
  [key: string]: Delegate
}
