import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  Proposal,
  ProposalTransaction,
} from '@solana/spl-governance'

import { withExecuteTransaction } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'

export const executeTransaction = async (
  { connection, wallet, programId }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  instruction: ProgramAccount<ProposalTransaction>
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  await withExecuteTransaction(
    instructions,
    programId,
    programVersion,
    proposal.account.governance,
    proposal.pubkey,
    instruction.pubkey,
    [instruction.account.getSingleInstruction()]
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  const c = await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Executing instruction',
    successMessage: 'Execution finalized',
  })
  console.log(c)
}
