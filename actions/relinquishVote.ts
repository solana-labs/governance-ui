import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { Proposal } from '../models/accounts'
import { RpcContext } from '../models/core/api'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from '../utils/send'
import { withRelinquishVote } from '@models/withRelinquishVote'

export const relinquishVote = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  tokenOwnerRecord: PublicKey,
  voteRecord: PublicKey,
  instructions: TransactionInstruction[] = []
) => {
  const signers: Keypair[] = []

  const governanceAuthority = walletPubkey
  const beneficiary = walletPubkey

  withRelinquishVote(
    instructions,
    programId,
    proposal.account.governance,
    proposal.pubkey,
    tokenOwnerRecord,
    proposal.account.governingTokenMint,
    voteRecord,
    governanceAuthority,
    beneficiary
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })
}
