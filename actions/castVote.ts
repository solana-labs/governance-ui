import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  ChatMessageBody,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  withPostChatMessage,
  YesNoVote,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'

import { Vote } from '@solana/spl-governance'

import { withCastVote } from '@solana/spl-governance'
import { sendTransaction } from '../utils/send'

export async function castVote(
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  realm: PublicKey,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  yesNoVote: YesNoVote,
  message?: ChatMessageBody | undefined
) {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey

  await withCastVote(
    instructions,
    programId,
    programVersion,
    realm,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    tokeOwnerRecord,
    governanceAuthority,
    proposal.account.governingTokenMint,
    Vote.fromYesNoVote(yesNoVote),
    payer
  )

  if (message) {
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
      undefined,
      message
    )
  }

  const transaction = new Transaction()
  transaction.add(...instructions)

  await sendTransaction({ transaction, wallet, connection, signers })
}
