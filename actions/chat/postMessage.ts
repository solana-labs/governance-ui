import {
  PublicKey,
  Keypair,
  // Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { ChatMessageBody } from '@solana/spl-governance'
import { withPostChatMessage } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { chunks } from '@utils/helpers'
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'

export async function postChatMessage(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  body: ChatMessageBody,
  replyTo?: PublicKey,
  client?: VotingClient
) {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []
  const createNftTicketsIxs: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey
  //will run only if plugin is connected with realm
  const plugin = await client?.withUpdateVoterWeightRecord(
    instructions,
    tokeOwnerRecord,
    'commentProposal',
    createNftTicketsIxs
  )

  await withPostChatMessage(
    instructions,
    signers,
    GOVERNANCE_CHAT_PROGRAM_ID,
    programId,
    realm.pubkey,
    proposal.account.governance,
    proposal.pubkey,
    tokeOwnerRecord.pubkey,
    governanceAuthority,
    payer,
    replyTo,
    body,
    plugin?.voterWeightPk
  )

  // createTicketIxs is a list of instructions that create nftActionTicket only for nft-voter-v2 plugin
  // so it will be empty for other plugins or just spl-governance
  const nftTicketAccountsChuncks = chunks(createNftTicketsIxs, 1)

  const postMessageIxsChunk = [instructions]

  const instructionsChunks = [
    ...nftTicketAccountsChuncks.map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          [],
          batchIdx
        ),
        sequenceType: SequenceType.Parallel,
      }
    }),
    ...postMessageIxsChunk.map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          [signers],
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    }),
  ]

  await sendTransactionsV3({
    connection,
    wallet,
    transactionInstructions: instructionsChunks,
    callbacks: undefined,
  })

  // const transaction = new Transaction()
  // transaction.add(...instructions)
  // await sendTransaction({ transaction, wallet, connection, signers })
}
