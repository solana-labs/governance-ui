import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { Proposal } from '../../models/accounts'
import { ChatMessageBody } from '../../models/chat/accounts'
import { withPostChatMessage } from '../../models/chat/withPostChatMessage'
import { ParsedAccount } from '../../models/core/accounts'
import { RpcContext } from '../../models/core/api'
import { sendTransaction } from '../../utils/send'

export async function postChatMessage(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  proposal: ParsedAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  body: ChatMessageBody,
  replyTo?: PublicKey
) {
  const signers: Account[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey

  await withPostChatMessage(
    instructions,
    signers,
    programId,
    proposal.info.governance,
    proposal.pubkey,
    tokeOwnerRecord,
    governanceAuthority,
    payer,
    replyTo,
    body
  )

  const transaction = new Transaction()
  instructions.forEach((instruction) => transaction.add(instruction))

  await sendTransaction({ transaction, wallet, connection, signers })
}
