import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { Proposal } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'

import { Vote } from '@solana/spl-governance'

import { withCastVote } from '../models/withCastVote'
import { sendTransaction } from '../utils/send'

export async function castVote(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: PublicKey,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  vote: Vote
) {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey

  await withCastVote(
    instructions,
    programId,
    realm,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    tokeOwnerRecord,
    governanceAuthority,
    proposal.account.governingTokenMint,
    vote,
    payer
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })
}
