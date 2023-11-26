import useWalletOnePointOh from './useWalletOnePointOh'
import useRealm from './useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import { useAsyncCallback } from 'react-async-hook'
import {
  ChatMessageBody,
  ChatMessageBodyType,
  ProgramAccount,
  Proposal,
  RpcContext,
  Vote,
  VoteChoice,
  VoteKind,
  getTokenOwnerRecordAddress,
  withCastVote,
} from '@solana/spl-governance'
import { getProgramVersionForRealm } from '@models/registry/api'
import queryClient from './queries/queryClient'
import { voteRecordQueryKeys } from './queries/voteRecord'
import { castVote } from 'actions/castVote'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { notify } from '@utils/notifications'
import { useRealmQuery } from './queries/realm'
import { useRealmConfigQuery } from './queries/realmConfig'
import { proposalQueryKeys, useRouteProposalQuery } from './queries/proposal'
import useLegacyConnectionContext from './useLegacyConnectionContext'
import { NFT_PLUGINS_PKS } from '@constants/plugins'
import { TransactionInstruction } from '@solana/web3.js'
import useProgramVersion from './useProgramVersion'
import useVotingTokenOwnerRecords from './useVotingTokenOwnerRecords'
import { useMemo } from 'react'
import { useTokenOwnerRecordsDelegatedToUser } from './queries/tokenOwnerRecord'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'

export const useSubmitVote = () => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const proposal = useRouteProposalQuery().data?.result
  const { realmInfo } = useRealm()
  const { closeNftVotingCountingModal } = useNftProposalStore.getState()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )

  const isNftPlugin =
    config?.account.communityTokenConfig.voterWeightAddin &&
    NFT_PLUGINS_PKS.includes(
      config?.account.communityTokenConfig.voterWeightAddin?.toBase58()
    )

  const selectedCommunityDelegator = useSelectedDelegatorStore(
    (s) => s.communityDelegator
  )
  const selectedCouncilDelegator = useSelectedDelegatorStore(
    (s) => s.councilDelegator
  )
  const delegators = useTokenOwnerRecordsDelegatedToUser()

  const { error, loading, execute } = useAsyncCallback(
    async ({
      vote,
      comment,
      voteWeights,
    }: {
      vote: VoteKind
      comment?: string
      voteWeights?: number[]
    }) => {
      if (!proposal) throw new Error()
      if (!realm) throw new Error()

      const rpcContext = new RpcContext(
        proposal.owner,
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )

      const msg = comment
        ? new ChatMessageBody({
            type: ChatMessageBodyType.Text,
            value: comment,
          })
        : undefined

      const confirmationCallback = async () => {
        await queryClient.invalidateQueries(
          voteRecordQueryKeys.all(connection.cluster)
        )
      }

      const relevantMint =
        vote !== VoteKind.Veto
          ? // if its not a veto, business as usual
            proposal.account.governingTokenMint
          : // if it is a veto, the vetoing mint is the opposite of the governing mint
          realm.account.communityMint.equals(
              proposal.account.governingTokenMint
            )
          ? realm.account.config.councilMint
          : realm.account.communityMint
      if (relevantMint === undefined) throw new Error()

      const role = relevantMint.equals(realm.account.communityMint)
        ? 'community'
        : 'council'

      const relevantSelectedDelegator =
        role === 'community'
          ? selectedCommunityDelegator
          : selectedCouncilDelegator

      const actingAsWalletPk =
        relevantSelectedDelegator ?? wallet?.publicKey ?? undefined
      if (!actingAsWalletPk) throw new Error()

      const tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
        realm.owner,
        realm.pubkey,
        relevantMint,
        actingAsWalletPk
      )

      const relevantDelegators =
        // if the user is manually selecting a delegator, don't auto-vote for the rest of the delegators
        // ("delegator" is a slight misnomer here since you can select yourself, so that you dont vote with your other delegators)
        relevantSelectedDelegator !== undefined
          ? []
          : delegators
              ?.filter((x) => x.account.governingTokenMint.equals(relevantMint))
              .map((x) => x.pubkey)

      try {
        await castVote(
          rpcContext,
          realm,
          proposal,
          tokenOwnerRecordPk,
          vote,
          msg,
          role === 'community' ? client : undefined, // NOTE: currently FE doesn't support council plugins fully
          confirmationCallback,
          voteWeights,
          relevantDelegators
        )
        queryClient.invalidateQueries({
          queryKey: proposalQueryKeys.all(connection.current.rpcEndpoint),
        })
        msg &&
          queryClient.invalidateQueries({
            queryKey: [connection.cluster, 'ChatMessages'],
          })
      } catch (e) {
        console.error(e)
        notify({ type: 'error', message: e.message })
      } finally {
        if (isNftPlugin) {
          closeNftVotingCountingModal(
            client.client as NftVoterClient,
            proposal!,
            wallet!.publicKey!
          )
        }
      }
    }
  )

  return {
    error,
    submitting: loading,
    submitVote: execute,
  }
}

type VoteArgs = {
  voteKind: VoteKind
  governingBody: 'community' | 'council'
  proposal: ProgramAccount<Proposal>
  comment?: string
}

/** This is WIP and shouldn't be used
 * @deprecated
 */
export const useCreateVoteIxs = () => {
  // get info
  const programVersion = useProgramVersion()
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()
  const votingPluginClient = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const getVotingTokenOwnerRecords = useVotingTokenOwnerRecords()

  // get delegates

  // api
  const walletPk = wallet?.publicKey ?? undefined
  return useMemo(
    () =>
      realm !== undefined &&
      programVersion !== undefined &&
      walletPk !== undefined
        ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
          async ({ voteKind, governingBody, proposal, comment }: VoteArgs) => {
            //const signers: Keypair[] = []
            const instructions: TransactionInstruction[] = []

            const governingTokenMint =
              governingBody === 'community'
                ? realm.account.communityMint
                : realm.account.config.councilMint
            if (governingTokenMint === undefined)
              throw new Error(`no mint for ${governingBody} governing body`)

            const vote = formatVote(voteKind)

            const votingTors = await getVotingTokenOwnerRecords(governingBody)
            for (const torPk of votingTors) {
              //will run only if any plugin is connected with realm
              const votingPluginHelpers = await votingPluginClient?.withCastPluginVote(
                instructions,
                proposal,
                torPk
              )

              await withCastVote(
                instructions,
                realm.owner,
                programVersion,
                realm.pubkey,
                proposal.account.governance,
                proposal.pubkey,
                proposal.account.tokenOwnerRecord,
                torPk,
                walletPk,
                governingTokenMint,
                vote,
                walletPk,
                votingPluginHelpers?.voterWeightPk,
                votingPluginHelpers?.maxVoterWeightRecord
              )

              return instructions
            }
          }
        : undefined,
    [
      getVotingTokenOwnerRecords,
      programVersion,
      realm,
      votingPluginClient,
      walletPk,
    ]
  )
}

const formatVote = (voteKind: VoteKind) =>
  // It is not clear that defining these extraneous fields, `deny` and `veto`, is actually necessary.
  // See:  https://discord.com/channels/910194960941338677/910630743510777926/1044741454175674378
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
