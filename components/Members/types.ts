import { TokenOwnerRecord, VoteRecord } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'

export enum ViewState {
  MainView,
  MemberOverview,
}

export interface TokenRecordsWithWalletAddress {
  walletAddress: string
  council?: ParsedAccount<TokenOwnerRecord> | undefined
  community?: ParsedAccount<TokenOwnerRecord> | undefined
}

export interface WalletTokenRecordWithProposal
  extends ParsedAccount<VoteRecord> {
  proposalPublicKey: string
  proposalName: string
}
