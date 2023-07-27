import useWalletOnePointOh from './useWalletOnePointOh'
import useRealm from './useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import { useAsyncCallback } from 'react-async-hook'
import {
  ChatMessageBody,
  ChatMessageBodyType,
  ProgramAccount,
  RpcContext,
  TokenOwnerRecord,
  VoteKind,
} from '@solana/spl-governance'
import { getProgramVersionForRealm } from '@models/registry/api'
import queryClient from './queries/queryClient'
import { voteRecordQueryKeys } from './queries/voteRecord'
import { castVote } from 'actions/castVote'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { notify } from '@utils/notifications'
import { useRealmQuery } from './queries/realm'
import { useRealmConfigQuery } from './queries/realmConfig'
import { useRouteProposalQuery } from './queries/proposal'
import useLegacyConnectionContext from './useLegacyConnectionContext'
import { NFT_PLUGINS_PKS } from '@constants/plugins'

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

  const { error, loading, execute } = useAsyncCallback(
    async ({
      vote,
      voterTokenRecord,
      comment,
    }: {
      vote: VoteKind
      voterTokenRecord: ProgramAccount<TokenOwnerRecord>
      comment?: string
    }) => {
      const rpcContext = new RpcContext(
        proposal!.owner,
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

      try {
        await castVote(
          rpcContext,
          realm!,
          proposal!,
          voterTokenRecord,
          vote,
          false,
          msg,
          client,
          confirmationCallback
        )
        queryClient.invalidateQueries({
          queryKey: ['Proposal'],
        })
      } catch (e) {
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

  const { error: multiChoiceError, loading: multiChoiceLoading, execute: multiChoiceExecute } = useAsyncCallback(
    async ({
      vote,
      voterTokenRecord,
      voteWeights,
      comment,
    }: {
      vote: VoteKind
      voterTokenRecord: ProgramAccount<TokenOwnerRecord>
      voteWeights: number[]
      comment?: string
    }) => {
      const rpcContext = new RpcContext(
        proposal!.owner,
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

      try {
        await castVote(
          rpcContext,
          realm!,
          proposal!,
          voterTokenRecord,
          vote,
          true,
          msg,
          client,
          confirmationCallback,
          voteWeights
        )
        queryClient.invalidateQueries({
          queryKey: ['Proposal'],
        })
      } catch (e) {
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
    multiChoiceError,
    multiChoiceSubmitting: multiChoiceLoading,
    multiChoiceSubmitVote: multiChoiceExecute
  }
}
