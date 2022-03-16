import {
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
} from '@solana/spl-governance'
import { ChatMessageBody } from '@solana/spl-governance'
import { withPostChatMessage } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { sendTransaction } from '../../utils/send'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/sdk/withUpdateVoterWeightRecord'

export async function postChatMessage(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  body: ChatMessageBody,
  replyTo?: PublicKey,
  client?: VsrClient
) {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey

  //will run only if plugin is connected with realm
  const voterWeight = await withUpdateVoterWeightRecord(
    instructions,
    wallet.publicKey!,
    realm,
    client
  )

  await withPostChatMessage(
    instructions,
    signers,
    GOVERNANCE_CHAT_PROGRAM_ID,
    programId,
    realm.pubkey,
    proposal.account.governance,
    proposal.pubkey,
    tokeOwnerRecord,
    governanceAuthority,
    payer,
    replyTo,
    body,
    voterWeight
  )

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })
}
