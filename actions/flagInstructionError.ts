import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { Proposal } from '../models/accounts'

import { withFlagInstructionError } from '../models/withFlagInstructionError'
import { RpcContext } from '../models/core/api'
import { ParsedAccount } from '@models/core/accounts'
import { sendTransaction } from '@utils/send'

export const flagInstructionError = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ParsedAccount<Proposal>,
  proposalInstruction: PublicKey
) => {
  const governanceAuthority = walletPubkey

  const signers: Account[] = []
  const instructions: TransactionInstruction[] = []

  withFlagInstructionError(
    instructions,
    programId,
    proposal.pubkey,
    proposal.info.tokenOwnerRecord,
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
