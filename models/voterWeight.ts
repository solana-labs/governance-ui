import { TokenOwnerRecord } from './accounts'
import { ParsedAccount } from './core/accounts'

/// VoterWeight encapsulates logic to determine voter weights from token records (community or council)
export class VoterWeight {
  communityTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined
  councilTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined

  constructor(
    communityTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined,
    councilTokenRecord: ParsedAccount<TokenOwnerRecord> | undefined
  ) {
    this.communityTokenRecord = communityTokenRecord
    this.councilTokenRecord = councilTokenRecord
  }

  // Checks if the voter has any voting weight
  hasAnyWeight() {
    return (
      !this.communityTokenRecord?.info.governingTokenDepositAmount.isZero() ||
      !this.councilTokenRecord?.info.governingTokenDepositAmount.isZero()
    )
  }

  // Returns first available tokenRecord
  getTokenRecord() {
    if (this.communityTokenRecord) {
      return this.communityTokenRecord.pubkey
    }
    if (this.councilTokenRecord) {
      return this.councilTokenRecord.pubkey
    }

    throw new Error('Current wallet has no Token Owner Records')
  }
}
