import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  ChatMessageBody,
  Proposal,
  Realm,
  withPostChatMessage,
  YesNoVote,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'

import { Vote } from '@solana/spl-governance'

import { withCastVote } from '@solana/spl-governance'
import { sendTransaction } from '../utils/send'
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/actions/withUpdateVoterWeightRecord'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

export async function castVote(
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  yesNoVote: YesNoVote,
  message?: ChatMessageBody | undefined,
  client?: VsrClient
) {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey

  //will run only if plugin is connected with realm
  await withUpdateVoterWeightRecord(
    instructions,
    wallet.publicKey!,
    realm,
    client
  )

  await withCastVote(
    instructions,
    programId,
    programVersion,
    realm.pubkey,
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
      programId,
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
