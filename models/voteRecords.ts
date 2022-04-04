import {
  GovernanceAccountType,
  VoteKind,
  VoteRecord,
} from '@solana/spl-governance'

export function isYesVote(voteRecord: VoteRecord) {
  switch (voteRecord.accountType) {
    case GovernanceAccountType.VoteRecordV1: {
      return voteRecord.voteWeight?.yes && !voteRecord.voteWeight.yes.isZero()
    }
    case GovernanceAccountType.VoteRecordV2: {
      switch (voteRecord.vote?.voteType) {
        case VoteKind.Approve: {
          return true
        }
        case VoteKind.Deny: {
          return false
        }
        default:
          throw new Error('Invalid voteKind')
      }
    }
    default:
      throw new Error(`Invalid account type ${voteRecord.accountType} `)
  }
}

export function getVoteWeight(voteRecord: VoteRecord) {
  if (isYesVote(voteRecord)) {
    return voteRecord.getYesVoteWeight()
  }

  return voteRecord.getNoVoteWeight()
}
