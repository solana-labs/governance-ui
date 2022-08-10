import {
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  ChatMessageBody,
  getGovernanceProgramVersion,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
  TokenOwnerRecord,
  withPostChatMessage,
  YesNoVote,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'

import { Vote } from '@solana/spl-governance'

import { withCastVote } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { chunks } from '@utils/helpers'
import {
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
} from '@utils/sendTransactions'
import { sendTransaction } from '@utils/send'
import { NftVoterClient } from '@solana/governance-program-library'
import { notify } from '@utils/notifications'

export async function castVote(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: ProgramAccount<TokenOwnerRecord>,
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
    proposal,
    tokeOwnerRecord
  )

  await withCastVote(
    instructions,
    programId,
    programVersion,
    realm.pubkey,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    tokeOwnerRecord.pubkey,
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
      tokeOwnerRecord,
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
      tokeOwnerRecord.pubkey,
      governanceAuthority,
      payer,
      undefined,
      message,
      plugin?.voterWeightPk
    )
  }
  const shouldChunk = votingPlugin?.client instanceof NftVoterClient
  const instructionsCountThatMustHaveTheirOwnChunk = message ? 4 : 2
  const solBefore = await connection.getBalance(wallet.publicKey!)
  if (shouldChunk) {
    const castVoteAndUpdateVoterWeightCost = 1515320
    const oneNftCost = 1670400
    const commentCost = 1673440
    const commentCharacterCost = 6960
    const singleTransactionCosts = 5000

    let baseCost = castVoteAndUpdateVoterWeightCost
    const nftVotesCosts = oneNftCost * votingPlugin.votingNfts.length
    if (message) {
      baseCost += commentCost + message.value.length * commentCharacterCost
    }

    const instructionsWithTheirOwnChunk = instructions.slice(
      -instructionsCountThatMustHaveTheirOwnChunk
    )
    const remainingInstructionsToChunk = instructions.slice(
      0,
      instructions.length - instructionsCountThatMustHaveTheirOwnChunk
    )
    const splInstructionsWithAccountsChunk = chunks(
      instructionsWithTheirOwnChunk,
      2
    )
    const nftsAccountsChunks = chunks(remainingInstructionsToChunk, 2)

    const signerChunks = Array(
      splInstructionsWithAccountsChunk.length + nftsAccountsChunks.length
    ).fill([])

    const singersMap = message
      ? [...signerChunks.slice(0, signerChunks.length - 1), signers]
      : signerChunks
    const instructionsChunks = [
      ...nftsAccountsChunks.map((x) =>
        transactionInstructionsToTypedInstructionsSets(x, SequenceType.Parallel)
      ),
      ...splInstructionsWithAccountsChunk.map((x) =>
        transactionInstructionsToTypedInstructionsSets(
          x,
          SequenceType.Sequential
        )
      ),
    ]
    const pureTransactionsCosts =
      instructionsChunks.length * singleTransactionCosts
    const totalVoteCost = nftVotesCosts + baseCost + pureTransactionsCosts
    const currentWalletSol = await connection.getBalance(wallet.publicKey!)
    const hasEnoughSol = currentWalletSol - totalVoteCost > 0
    if (!hasEnoughSol) {
      notify({
        type: 'error',
        message: `Your wallet don't have enough SOL to vote. You need at least ${
          totalVoteCost / LAMPORTS_PER_SOL
        } SOL to vote`,
      })
      return
    }
    await sendTransactionsV2({
      connection,
      wallet,
      TransactionInstructions: instructionsChunks,
      signersSet: singersMap,
      showUiComponent: true,
    })
  } else {
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({ transaction, wallet, connection, signers })
  }
  const solAfter = await connection.getBalance(wallet.publicKey!)
  console.log({ solBefore, solAfter })
}
