import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  ChatMessageBody,
  getGovernanceProgramVersion,
  GovernanceAccountType,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
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
import { calcCostOfNftVote, checkHasEnoughSolToVote } from '@tools/nftVoteCalc'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { fetchRealmByPubkey } from '@hooks/queries/realm'
import { fetchProposalByPubkeyQuery } from '@hooks/queries/proposal'
import { findPluginName } from '@hooks/queries/governancePower'

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

const DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN: Record<
  ReturnType<typeof findPluginName>,
  boolean
> = {
  vanilla: true,
  VSR: false,
  HeliumVSR: false,
  gateway: false,
  NFT: false,
  unknown: false,
}

const createDelegatorVote = async ({
  connection,
  realmPk,
  proposalPk,
  tokenOwnerRecordPk,
  userPk,
  vote,
}: {
  connection: Connection
  realmPk: PublicKey
  proposalPk: PublicKey
  tokenOwnerRecordPk: PublicKey
  userPk: PublicKey
  vote: Vote
}) => {
  //
  const realm = (await fetchRealmByPubkey(connection, realmPk)).result
  if (!realm) throw new Error()
  const proposal = (await fetchProposalByPubkeyQuery(connection, proposalPk))
    .result
  if (!proposal) throw new Error()

  const programVersion = await getGovernanceProgramVersion(
    connection,
    realm.owner
  )

  const castVoteIxs: TransactionInstruction[] = []
  await withCastVote(
    castVoteIxs,
    realm.owner,
    programVersion,
    realm.pubkey,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    tokenOwnerRecordPk,
    userPk,
    proposal.account.governingTokenMint,
    vote,
    userPk
    //plugin?.voterWeightPk,
    //plugin?.maxVoterWeightRecord
  )
  return castVoteIxs
}

export async function castVote(
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  tokenOwnerRecord: PublicKey,
  voteKind: VoteKind,
  message?: ChatMessageBody | undefined,
  votingPlugin?: VotingClient,
  runAfterConfirmation?: (() => void) | null,
  voteWeights?: number[],
  additionalTokenOwnerRecords?: []
) {
  const chatMessageSigners: Keypair[] = []

  const createCastNftVoteTicketIxs: TransactionInstruction[] = []
  const createPostMessageTicketIxs: TransactionInstruction[] = []

  const governanceAuthority = walletPubkey
  const payer = walletPubkey
  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId
  )

  const pluginCastVoteIxs: TransactionInstruction[] = []
  //will run only if any plugin is connected with realm
  const plugin = await votingPlugin?.withCastPluginVote(
    pluginCastVoteIxs,
    proposal,
    tokenOwnerRecord,
    createCastNftVoteTicketIxs
  )

  const isMulti =
    proposal.account.voteType !== VoteType.SINGLE_CHOICE &&
    proposal.account.accountType === GovernanceAccountType.ProposalV2

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

  const castVoteIxs: TransactionInstruction[] = []
  await withCastVote(
    castVoteIxs,
    programId,
    programVersion,
    realm.pubkey,
    proposal.account.governance,
    proposal.pubkey,
    proposal.account.tokenOwnerRecord,
    tokenOwnerRecord,
    governanceAuthority,
    tokenMint,
    vote,
    payer,
    plugin?.voterWeightPk,
    plugin?.maxVoterWeightRecord
  )

  const delegatorCastVoteAtoms =
    additionalTokenOwnerRecords &&
    DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[
      findPluginName(votingPlugin?.client?.program.programId)
    ]
      ? await Promise.all(
          additionalTokenOwnerRecords.map((tokenOwnerRecordPk) =>
            createDelegatorVote({
              connection,
              realmPk: realm.pubkey,
              proposalPk: proposal.pubkey,
              tokenOwnerRecordPk,
              userPk: walletPubkey,
              vote,
            })
          )
        )
      : []

  const pluginPostMessageIxs: TransactionInstruction[] = []
  const postMessageIxs: TransactionInstruction[] = []
  if (message) {
    const plugin = await votingPlugin?.withUpdateVoterWeightRecord(
      pluginPostMessageIxs,
      tokenOwnerRecord,
      'commentProposal',
      createPostMessageTicketIxs
    )

    await withPostChatMessage(
      postMessageIxs,
      chatMessageSigners,
      GOVERNANCE_CHAT_PROGRAM_ID,
      programId,
      realm.pubkey,
      proposal.account.governance,
      proposal.pubkey,
      tokenOwnerRecord,
      governanceAuthority,
      payer,
      undefined,
      message,
      plugin?.voterWeightPk
    )
  }

  const isNftVoter = votingPlugin?.client instanceof NftVoterClient
  const isHeliumVoter = votingPlugin?.client instanceof HeliumVsrClient

  if (!isNftVoter && !isHeliumVoter) {
    const batch1 = [
      ...pluginCastVoteIxs,
      ...castVoteIxs,
      ...pluginPostMessageIxs,
      ...postMessageIxs,
    ]
    // chunk size chosen conservatively. "Atoms" refers to atomic clusters of instructions (namely, updatevoterweight? + vote)
    const delegatorBatches = chunks(delegatorCastVoteAtoms, 2).map((x) =>
      x.flat()
    )
    const actions = [batch1, ...delegatorBatches].map((ixs) => ({
      instructionsSet: ixs.map((ix) => ({
        transactionInstruction: ix,
        signers: chatMessageSigners.filter((kp) =>
          ix.keys.find((key) => key.isSigner && key.pubkey.equals(kp.publicKey))
        ),
      })),
      sequenceType: SequenceType.Parallel,
    }))

    await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: actions,
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
  if (isHeliumVoter) {
    // @asktree: I'm aware of no rationale for chunking in this particular manner
    const chunkerz = chunks(
      [
        ...pluginCastVoteIxs,
        ...castVoteIxs,
        ...pluginPostMessageIxs,
        ...postMessageIxs,
      ],
      2
    )

    const ixsChunks = chunkerz.map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          message ? [[], chatMessageSigners] : [], // seeing signer related bugs when posting chat? This is likely culprit
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    })

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

    const createNftVoteTicketsChunks = chunks(
      [...createCastNftVoteTicketIxs, ...createPostMessageTicketIxs],
      1
    )
    const otherChunks = chunks(
      [
        ...pluginCastVoteIxs,
        ...castVoteIxs,
        ...pluginPostMessageIxs,
        ...postMessageIxs,
      ],
      2
    )

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
      ...otherChunks.map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            message ? [[], chatMessageSigners] : [], // seeing signer related bugs when posting chat? This is likely culprit
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
