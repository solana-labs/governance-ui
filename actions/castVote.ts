import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { Proposal } from '../models/accounts'
import { ParsedAccount } from '../models/core/accounts'
import { RpcContext } from '../models/core/api'

import { Vote } from '../models/instructions'

import { withCastVote } from '../models/withCastVote'
import { sendTransaction } from '../utils/send'

export async function castVote(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: PublicKey,
  proposal: ParsedAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  vote: Vote
) {
  const signers: Account[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey

  await withCastVote(
    instructions,
    programId,
    realm,
    proposal.info.governance,
    proposal.pubkey,
    proposal.info.tokenOwnerRecord,
    tokeOwnerRecord,
    governanceAuthority,
    proposal.info.governingTokenMint,
    vote,
    payer
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })
}
