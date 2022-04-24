import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  ChatMessageBody,
  getGovernanceProgramVersion,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
  withPostChatMessage,
  YesNoVote,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'

import { Vote } from '@solana/spl-governance'

import { withCastVote } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { chunks } from '@utils/helpers'
import { sendTransactions, SequenceType } from '@utils/sendTransactions'
import { sendTransaction } from '@utils/send'
import { NftVoterClient } from '@solana/governance-program-library'

export async function castVote(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: PublicKey,
  yesNoVote: YesNoVote,
  message?: ChatMessageBody | undefined,
  votingPlugin?: VotingClient
) {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey
  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  //will run only if any plugin is connected with realm
  const plugin = await votingPlugin?.withCastPluginVote(
    instructions,
    proposal.pubkey
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
    payer,
    plugin?.voterWeightPk,
    plugin?.maxVoterWeightRecord
  )

  if (message) {
    const plugin = await votingPlugin?.withUpdateVoterWeightRecord(
      instructions,
      'commentProposal'
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
      undefined,
      message,
      plugin?.voterWeightPk
    )
  }
  const chunkTreshold = message ? 4 : 2
  const shouldChunk = votingPlugin?.client instanceof NftVoterClient
  if (shouldChunk) {
    const insertChunks = chunks(instructions, 1)
    const chunkWithLastTwoMerge = [
      ...insertChunks.splice(0, insertChunks.length - chunkTreshold),
      ...chunks([...insertChunks.splice(-chunkTreshold).flatMap((x) => x)], 2),
    ]
    const signerChunks = Array(chunkWithLastTwoMerge.length).fill([])
    const singersMap = message
      ? [...signerChunks.splice(0, signerChunks.length - 1), signers]
      : signerChunks

    await sendTransactions(
      connection,
      wallet,
      [...chunkWithLastTwoMerge],
      singersMap,
      SequenceType.Sequential
    )
  } else {
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({ transaction, wallet, connection, signers })
  }
}
