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
  VoteType,
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
import { calcCostOfNftVote, checkHasEnoughSolToVote } from '@tools/nftVoteCalc'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'

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
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  voteKind: VoteKind,
  message?: ChatMessageBody | undefined,
  votingPlugin?: VotingClient,
  runAfterConfirmation?: (() => void) | null,
  voteWeights?: number[]
) {
  const signers: Keypair[] = []
  const castVoteIxs: TransactionInstruction[] = []
  const postMessageIxs: TransactionInstruction[] = []

  const createTicketIxs: TransactionInstruction[] = []

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
    castVoteIxs,
    proposal,
    tokenOwnerRecord,
    createTicketIxs
  )

  const isMulti = proposal.account.voteType !== VoteType.SINGLE_CHOICE

  // It is not clear that defining these extraneous fields, `deny` and `veto`, is actually necessary.
  // See:  https://discord.com/channels/910194960941338677/910630743510777926/1044741454175674378
  const vote = isMulti
    ? new Vote({
        voteType: VoteKind.Approve,
        approveChoices: proposal.account.options.map((_o, index) => {
          if (voteWeights?.includes(index)) {
            return new VoteChoice({ rank: 0, weightPercentage: 100 })
          } else {
            return new VoteChoice({ rank: 0, weightPercentage: 0 })
          }
        }),
        deny: undefined,
        veto: undefined,
      })
    : voteKind === VoteKind.Approve
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
    castVoteIxs,
    programId,
    programVersion,
    realm.pubkey,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    tokenOwnerRecord.pubkey,
    governanceAuthority,
    tokenMint,
    vote,
    payer,
    plugin?.voterWeightPk,
    plugin?.maxVoterWeightRecord
  )

  if (message) {
    const plugin = await votingPlugin?.withUpdateVoterWeightRecord(
      postMessageIxs,
      tokenOwnerRecord,
      'commentProposal'
    )

    await withPostChatMessage(
      postMessageIxs,
      signers,
      GOVERNANCE_CHAT_PROGRAM_ID,
      programId,
      realm.pubkey,
      proposal.account.governance,
      proposal.pubkey,
      tokenOwnerRecord.pubkey,
      governanceAuthority,
      payer,
      undefined,
      message,
      plugin?.voterWeightPk
    )
  }

  const ixChunkCount = message ? 4 : 2
  const isNftVoter = votingPlugin?.client instanceof NftVoterClient
  const isHeliumVoter = votingPlugin?.client instanceof HeliumVsrClient

  if (!isNftVoter && !isHeliumVoter) {
    const instructions = [...castVoteIxs, ...postMessageIxs]
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({ transaction, wallet, connection, signers })
    if (runAfterConfirmation) {
      runAfterConfirmation()
    }
  }

  // we need to chunk instructions
  if (isHeliumVoter) {
    // update voter weight + cast vote from spl gov need to be in one transaction
    const instructions = [...castVoteIxs, ...postMessageIxs]
    const ixsWithOwnChunk = instructions.slice(-ixChunkCount)
    const remainingIxsToChunk = instructions.slice(
      0,
      instructions.length - ixChunkCount
    )

    const splIxsWithAccountsChunk = chunks(ixsWithOwnChunk, 2)
    const positionsAccountsChunks = chunks(remainingIxsToChunk, 2)
    const ixsChunks = [
      ...positionsAccountsChunks.map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [],
            batchIdx
          ),
          sequenceType: SequenceType.Parallel,
        }
      }),
      ...splIxsWithAccountsChunk.map((txBatch, batchIdx) => {
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

    await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: ixsChunks,
      callbacks: {
        afterAllTxConfirmed: () => {
          if (runAfterConfirmation) {
            runAfterConfirmation()
          }
        },
      },
    })
  }

  // we need to chunk instructions
  if (isNftVoter) {
    const {
      openNftVotingCountingModal,
      closeNftVotingCountingModal,
    } = useNftProposalStore.getState()
    // postMessageIxs.slice(0, -2) will be the ixs for create post message tickets
    // Only for nft-voter-v2. it will be empty for nft-voter
    createTicketIxs.push(...postMessageIxs.slice(0, -2))
    const createNftVoteTicketsChunks = chunks(createTicketIxs, 1)

    const splIxs = [...castVoteIxs.slice(-2), ...postMessageIxs.slice(-2)]
    const nftAccountIxs = castVoteIxs.slice(0, -2)

    const splIxsWithAccountsChunk = chunks(splIxs, 2)
    const nftsAccountsChunks = chunks(nftAccountIxs, 2)
    const instructionsChunks = [
      ...createNftVoteTicketsChunks.map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [],
            batchIdx
          ),
          sequenceType: SequenceType.Parallel,
        }
      }),
      ...nftsAccountsChunks.map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [],
            batchIdx
          ),
          sequenceType:
            // this is to ensure create all the nft_action_tickets account first
            batchIdx == 0 ? SequenceType.Sequential : SequenceType.Parallel,
        }
      }),
      ...splIxsWithAccountsChunk.map((txBatch, batchIdx) => {
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
  }
}
