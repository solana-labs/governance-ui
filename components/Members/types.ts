import { VoteRecord } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'

export interface WalletTokenRecordWithProposal
  extends ProgramAccount<VoteRecord> {
  proposalPublicKey: string
  proposalName: string
  chatMessages: string[]
}
