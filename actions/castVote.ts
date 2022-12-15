import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  ChatMessageBody,
  getGovernanceProgramVersion,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
  TokenOwnerRecord,
  VoteChoice,
  VoteKind,
  withPostChatMessage,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'

import { Vote } from '@solana/spl-governance'

import { withCastVote } from '@solana/spl-governance'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import { chunks } from '@utils/helpers'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { sendTransaction } from '@utils/send'
import { NftVoterClient } from '@solana/governance-program-library'
import { calcCostOfNftVote, checkHasEnoughSolToVote } from '@tools/nftVoteCalc'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'

const getVetoTokenMint = (
  proposal: ProgramAccount<Proposal>,
  realm: ProgramAccount<Realm>
) => {
  const communityMint = realm.account.communityMint
  const councilMint = realm.account.config.councilMint
  const governingMint = proposal.account.governingTokenMint
  const vetoTokenMint = governingMint.equals(communityMint)
    ? councilMint
    : communityMint
  if (vetoTokenMint === undefined)
    throw new Error('There is no token that can veto this proposal')
  return vetoTokenMint
}

export async function castVote(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  tokeOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  voteKind: VoteKind,
  message?: ChatMessageBody | undefined,
  votingPlugin?: VotingClient,
  runAfterConfirmation?: (() => void) | null
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

  // It is not clear that defining these extraneous fields, `deny` and `veto`, is actually necessary.
  // See:  https://discord.com/channels/910194960941338677/910630743510777926/1044741454175674378
  const vote =
    voteKind === VoteKind.Approve
      ? new Vote({
          voteType: VoteKind.Approve,
          approveChoices: [new VoteChoice({ rank: 0, weightPercentage: 100 })],
          deny: undefined,
          veto: undefined,
        })
      : voteKind === VoteKind.Deny
      ? new Vote({
          voteType: VoteKind.Deny,
          approveChoices: undefined,
          deny: true,
          veto: undefined,
        })
      : voteKind == VoteKind.Veto
      ? new Vote({
          voteType: VoteKind.Veto,
          veto: true,
          deny: undefined,
          approveChoices: undefined,
        })
      : new Vote({
          voteType: VoteKind.Abstain,
          veto: undefined,
          deny: undefined,
          approveChoices: undefined,
        })

  const tokenMint =
    voteKind === VoteKind.Veto
      ? getVetoTokenMint(proposal, realm)
      : proposal.account.governingTokenMint

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
    tokenMint,
    vote,
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
  if (shouldChunk) {
    const {
      openNftVotingCountingModal,
      closeNftVotingCountingModal,
    } = useNftProposalStore.getState()
    //update voter weight + cast vote from spl gov need to be in one transaction
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

    const instructionsChunks = [
      ...nftsAccountsChunks.map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [],
            batchIdx
          ),
          sequenceType: SequenceType.Parallel,
        }
      }),
      ...splInstructionsWithAccountsChunk.map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            message ? [[], signers] : [],
            batchIdx
          ),
          sequenceType: SequenceType.Sequential,
        }
      }),
    ]
    const totalVoteCost = await calcCostOfNftVote(
      message,
      instructionsChunks.length,
      proposal.pubkey,
      votingPlugin
    )
    const hasEnoughSol = await checkHasEnoughSolToVote(
      totalVoteCost,
      wallet.publicKey!,
      connection
    )
    if (!hasEnoughSol) {
      return
    }

    await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: instructionsChunks,
      callbacks: {
        afterFirstBatchSign: () => {
          instructionsChunks.length > 2 ? openNftVotingCountingModal() : null
        },
        afterAllTxConfirmed: () => {
          if (runAfterConfirmation) {
            runAfterConfirmation()
          }
          closeNftVotingCountingModal(
            votingPlugin.client as NftVoterClient,
            proposal,
            wallet.publicKey!
          )
        },
      },
    })
  } else {
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({ transaction, wallet, connection, signers })
  }
}
