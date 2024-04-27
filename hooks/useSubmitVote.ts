import useWalletOnePointOh from './useWalletOnePointOh'
import useRealm from './useRealm'
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
import { proposalQueryKeys, useRouteProposalQuery } from './queries/proposal'
import useLegacyConnectionContext from './useLegacyConnectionContext'
import { TransactionInstruction } from '@solana/web3.js'
import useProgramVersion from './useProgramVersion'
import useVotingTokenOwnerRecords from './useVotingTokenOwnerRecords'
import { useMemo } from 'react'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import { useBatchedVoteDelegators } from '@components/VotePanel/useDelegators'
import { useVotingClients } from '@hooks/useVotingClients'
import { useNftClient } from '../VoterWeightPlugins/useNftClient'
import { useRealmVoterWeightPlugins } from './useRealmVoterWeightPlugins'

export const useSubmitVote = () => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const proposal = useRouteProposalQuery().data?.result
  const { realmInfo } = useRealm()
  const { closeNftVotingCountingModal } = useNftProposalStore.getState()
  const votingClients = useVotingClients() // TODO this should be passed the role
  const { nftClient } = useNftClient()

  const isNftPlugin = !!nftClient

  const selectedCommunityDelegator = useSelectedDelegatorStore(
    (s) => s.communityDelegator
  )
  const selectedCouncilDelegator = useSelectedDelegatorStore(
    (s) => s.councilDelegator
  )
  const communityDelegators = useBatchedVoteDelegators('community')
  const councilDelegators = useBatchedVoteDelegators('council')

  const {
    voterWeightForWallet: voterWeightForWalletCommunity,
  } = useRealmVoterWeightPlugins('community')
  const {
    voterWeightForWallet: voterWeightForWalletCouncil,
  } = useRealmVoterWeightPlugins('council')

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

      const relevantDelegators = (role === 'community'
        ? communityDelegators
        : councilDelegators
      )?.map((x) => x.pubkey)

      const voterWeightForWallet =
        role === 'community'
          ? voterWeightForWalletCommunity
          : voterWeightForWalletCouncil
      const ownVoterWeight = relevantSelectedDelegator
        ? voterWeightForWallet(relevantSelectedDelegator)
        : wallet?.publicKey
        ? voterWeightForWallet(wallet?.publicKey)
        : undefined

      const votingClient = votingClients(role)
      try {
        await castVote(
          rpcContext,
          realm,
          proposal,
          tokenOwnerRecordPk,
          vote,
          msg,
          votingClient,
          confirmationCallback,
          voteWeights,
          relevantDelegators,
          ownVoterWeight?.value
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
            votingClient.client as NftVoterClient,
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
  const getVotingTokenOwnerRecords = useVotingTokenOwnerRecords()
  const votingClients = useVotingClients()

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
            const instructions: TransactionInstruction[] = []

            const governingTokenMint =
              governingBody === 'community'
                ? realm.account.communityMint
                : realm.account.config.councilMint
            if (governingTokenMint === undefined)
              throw new Error(`no mint for ${governingBody} governing body`)

            const votingClient = votingClients(governingBody)
            const vote = formatVote(voteKind)

            const votingTors = await getVotingTokenOwnerRecords(governingBody)
            for (const torPk of votingTors) {
              //will run only if any plugin is connected with realm
              const votingPluginHelpers = await votingClient.withCastPluginVote(
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
    [getVotingTokenOwnerRecords, programVersion, realm, votingClients, walletPk]
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
