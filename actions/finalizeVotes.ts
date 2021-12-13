import { ParsedAccount } from '@models/core/accounts'
import { RpcContext } from '@models/core/api'
import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { sendTransaction } from '@utils/send'

import { Proposal } from '../models/accounts'

import { withFinalizeVote } from '../models/withFinalizeVote'

export const finalizeVote = async (
  { connection, wallet, programId }: RpcContext,
  realm: PublicKey,
  proposal: ParsedAccount<Proposal>
) => {
  let signers: Account[] = []
  let instructions: TransactionInstruction[] = []

  console.log('proposal finalize vote', proposal, realm)

  withFinalizeVote(
    instructions,
    programId,
    realm,
    proposal.info.governance,
    proposal.pubkey,
    proposal.info.governingTokenMint
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Finalizing votes',
    successMessage: 'Votes finalized',
  })
}
