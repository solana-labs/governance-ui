import useWalletStore from 'stores/useWalletStore'
import useWalletOnePointOh from './useWalletOnePointOh'
import useRealm from './useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { nftPluginsPks } from './useVotingPlugins'
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

export const useSubmitVote = () => {
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { refetchProposals } = useWalletStore((s) => s.actions)
  const { realm, realmInfo, config } = useRealm()
  const { closeNftVotingCountingModal } = useNftProposalStore.getState()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )

  const isNftPlugin =
    config?.account.communityTokenConfig.voterWeightAddin &&
    nftPluginsPks.includes(
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
        await refetchProposals()
        // TODO refine this to only invalidate the one query
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
          msg,
          client,
          confirmationCallback
        )
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
  }
}
