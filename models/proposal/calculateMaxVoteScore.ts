import { ProgramAccount, Realm, Proposal } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import BN from 'bn.js'

import { calculateMintMaxVoteWeight } from '@models/proposal'

export function calculateMaxVoteScore(
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  governingTokenMint: MintInfo
) {
  if (proposal.account.isVoteFinalized() && proposal.account.maxVoteWeight) {
    return proposal.account.maxVoteWeight
  }

  if (
    proposal.account.governingTokenMint.toBase58() ===
    realm.account.config.councilMint?.toBase58()
  ) {
    return governingTokenMint.supply as BN
  }

  return calculateMintMaxVoteWeight(
    governingTokenMint,
    realm.account.config.communityMintMaxVoteWeightSource
  )
}
