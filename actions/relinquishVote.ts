import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

import { Proposal } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendTransaction } from '../utils/send'
import { withRelinquishVote } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { chunks } from '@utils/helpers'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { NftVoterClient } from '@solana/governance-program-library'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'

export const relinquishVote = async (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  realm: PublicKey,
  proposal: ProgramAccount<Proposal>,
  tokenOwnerRecord: PublicKey,
  voteRecord: PublicKey,
  instructions: TransactionInstruction[] = [],
  plugin: VotingClient
) => {
  const signers: Keypair[] = []

  const governanceAuthority = walletPubkey
  const beneficiary = walletPubkey
  await withRelinquishVote(
    instructions,
    programId,
    programVersion,
    realm,
    proposal.account.governance,
    proposal.pubkey,
    tokenOwnerRecord,
    proposal.account.governingTokenMint,
    voteRecord,
    governanceAuthority,
    beneficiary
  )

  await plugin.withRelinquishVote(
    instructions,
    proposal,
    voteRecord,
    tokenOwnerRecord
  )

  const shouldChunk =
    plugin?.client instanceof NftVoterClient ||
    plugin?.client instanceof HeliumVsrClient

  if (shouldChunk) {
    const insertChunks = chunks(instructions, 2)
    const instArray = [
      ...insertChunks.slice(0, 1).map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [],
            batchIdx
          ),
          sequenceType: SequenceType.Sequential,
        }
      }),
      ...insertChunks.slice(1, insertChunks.length).map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [],
            batchIdx
          ),
          sequenceType: SequenceType.Parallel,
        }
      }),
    ]

    await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: instArray,
    })
  } else {
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({ transaction, wallet, connection, signers })
  }
}
