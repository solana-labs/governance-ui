import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import { RpcContext } from '../models/core/api'
import { Proposal } from '@models/accounts'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withCancelProposal } from '@models/withCancelProposal'

export const cancelProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ProgramAccount<Proposal> | undefined
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  const governanceAuthority = walletPubkey

  withCancelProposal(
    instructions,
    programId,
    proposal!.pubkey,
    proposal!.account.tokenOwnerRecord,
    governanceAuthority
  )

  const transaction = new Transaction({ feePayer: walletPubkey })

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Cancelling proposal',
    successMessage: 'Proposal cancelled',
  })
}
