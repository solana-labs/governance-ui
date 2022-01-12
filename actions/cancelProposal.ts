import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import { RpcContext } from '@solana/spl-governance'
import { Proposal } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from 'utils/send'
import { withCancelProposal } from '@solana/spl-governance'

export const cancelProposal = async (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  proposal: ProgramAccount<Proposal> | undefined
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Keypair[] = []
  const governanceAuthority = walletPubkey

  withCancelProposal(
    instructions,
    programId,
    programVersion,
    proposal!.pubkey,
    proposal!.account.tokenOwnerRecord,
    governanceAuthority,
    proposal!.account.governance
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
