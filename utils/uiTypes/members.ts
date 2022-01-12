import { BN } from '@project-serum/anchor'

export interface Member {
  walletAddress: string
  votesCasted: number
  councilVotes: BN
  communityVotes: BN
  hasCouncilTokenOutsideRealm?: boolean
  hasCommunityTokenOutsideRealm?: boolean
}
