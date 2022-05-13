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
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
} from '@utils/sendTransactions'
import { NftVoterClient } from '@solana/governance-program-library'

export const relinquishVote = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
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
    proposal.account.governance,
    proposal.pubkey,
    tokenOwnerRecord,
    proposal.account.governingTokenMint,
    voteRecord,
    governanceAuthority,
    beneficiary
  )
  await plugin.withRelinquishVote(instructions, proposal, voteRecord)
  const shouldChunk = plugin?.client instanceof NftVoterClient
  if (shouldChunk) {
    const insertChunks = chunks(instructions, 2)
    const signerChunks = Array(instructions.length).fill([])
    const instArray = [
      ...insertChunks
        .slice(0, 1)
        .map((x) =>
          transactionInstructionsToTypedInstructionsSets(
            x,
            SequenceType.Sequential
          )
        ),
      ...insertChunks
        .slice(1, insertChunks.length)
        .map((x) =>
          transactionInstructionsToTypedInstructionsSets(
            x,
            SequenceType.Parallel
          )
        ),
    ]
    await sendTransactionsV2({
      connection,
      wallet,
      TransactionInstructions: instArray,
      signersSet: [...signerChunks],
      showUiComponent: true,
    })
  } else {
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({ transaction, wallet, connection, signers })
  }
}
