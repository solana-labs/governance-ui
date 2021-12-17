import { TokenOwnerRecord } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'

export enum ViewState {
  MainView,
  MemberOverview,
}

export interface TokenRecordWithWallet extends ParsedAccount<TokenOwnerRecord> {
  walletAddress: string
}
