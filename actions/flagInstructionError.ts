import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { Proposal } from '@solana/spl-governance'

import { withFlagTransactionError } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { fetchProgramVersion } from '@hooks/queries/useProgramVersionQuery'

export const flagInstructionError = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  proposalInstruction: PublicKey
) => {
  const governanceAuthority = walletPubkey

  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await fetchProgramVersion(connection, programId)

  withFlagTransactionError(
    instructions,
    programId,
    programVersion,
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
