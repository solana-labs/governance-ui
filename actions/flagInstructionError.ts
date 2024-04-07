import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'

import { Proposal } from '@solana/spl-governance'

import { withFlagTransactionError } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { fetchProgramVersion } from '@hooks/queries/useProgramVersionQuery'
import { SequenceType } from '@blockworks-foundation/mangolana/lib/globalTypes'
import { sendTransactionsV3 } from '@utils/sendTransactions'

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

  const txes = [instructions].map((txBatch) => {
    return {
      instructionsSet: txBatch.map((x) => {
        return {
          transactionInstruction: x,
          signers: signers,
        }
      }),
      sequenceType: SequenceType.Sequential,
    }
  })

  await sendTransactionsV3({
    connection,
    wallet,
    transactionInstructions: txes,
  })
}
