import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { Proposal } from '../models/accounts'
import { withRelinquishVote } from '../models/withRelinquishVote'

import { RpcContext } from '../models/core/api'
import { ParsedAccount } from '../models/core/accounts'
import { sendTransaction } from '../utils/send'

export const relinquishVote = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ParsedAccount<Proposal>,
  tokenOwnerRecord: PublicKey,
  voteRecord: PublicKey
) => {
  const signers: Account[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const beneficiary = walletPubkey

  withRelinquishVote(
    instructions,
    programId,
    proposal.info.governance,
    proposal.pubkey,
    tokenOwnerRecord,
    proposal.info.governingTokenMint,
    voteRecord,
    governanceAuthority,
    beneficiary
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })
}
