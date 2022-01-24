import {
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_CHAT_PROGRAM_ID, Proposal } from '@solana/spl-governance'
import { ChatMessageBody } from '@solana/spl-governance'
import { withPostChatMessage } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '../../utils/send'

export async function postChatMessage(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: PublicKey,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  body: ChatMessageBody,
  replyTo?: PublicKey
) {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey

  await withPostChatMessage(
    instructions,
    signers,
    GOVERNANCE_CHAT_PROGRAM_ID,
    programId,
    realm,
    proposal.account.governance,
    proposal.pubkey,
    tokeOwnerRecord,
    governanceAuthority,
    payer,
    replyTo,
    body
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })
}
