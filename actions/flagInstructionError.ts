import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { Proposal } from '@solana/spl-governance'

import { withFlagInstructionError } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'

export const flagInstructionError = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  proposalInstruction: PublicKey
) => {
  const governanceAuthority = walletPubkey

  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  withFlagInstructionError(
    instructions,
    programId,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    governanceAuthority,
    proposalInstruction
  )

  const transaction = new Transaction({ feePayer: walletPubkey })

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    connection,
    wallet,
    signers,
    sendingMessage: 'Flagging instruction as broken',
    successMessage: 'Instruction flagged as broken',
  })
}
