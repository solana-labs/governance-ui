import {
  InstructionDataWithHoldUpTime,
  createProposal,
} from 'actions/createProposal'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useRealm from './useRealm'
import useRpcContext from './useRpcContext'
import { fetchGovernanceByPubkey } from './queries/governance'
import { PublicKey } from '@solana/web3.js'
import { useRealmQuery } from './queries/realm'
import { useRealmConfigQuery } from './queries/realmConfig'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from './queries/mintInfo'
import useLegacyConnectionContext from './useLegacyConnectionContext'
import queryClient from './queries/queryClient'
import { proposalQueryKeys } from './queries/proposal'
import { createLUTProposal } from 'actions/createLUTproposal'

export default function useCreateProposal() {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )

  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { ownVoterWeight, canChooseWhoVote } = useRealm()
  const { getRpcContext } = useRpcContext()

  /** @deprecated because the api is goofy, use `propose` */
  const handleCreateProposal = async ({
    title,
    description,
    governance,
    instructionsData,
    voteByCouncil = false,
    isDraft = false,
    utilizeLookupTable,
  }: {
    title: string
    description: string
    governance: { pubkey: PublicKey }
    instructionsData: InstructionDataWithHoldUpTime[]
    voteByCouncil?: boolean
    isDraft?: boolean
    utilizeLookupTable?: boolean
  }) => {
    const { result: selectedGovernance } = await fetchGovernanceByPubkey(
      connection.current,
      governance.pubkey
    )
    if (!selectedGovernance) throw new Error('governance not found')
    if (!realm) throw new Error()

    const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
      selectedGovernance.account.config,
      voteByCouncil
    )

    const defaultProposalMint =
      !mint?.supply.isZero() ||
      config?.account.communityTokenConfig.voterWeightAddin
        ? realm?.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm?.account.config.councilMint
        : undefined

    const proposalMint =
      canChooseWhoVote && voteByCouncil
        ? realm?.account.config.councilMint
        : defaultProposalMint

    if (!proposalMint) {
      throw new Error('There is no suitable governing token for the proposal')
    }
    const rpcContext = getRpcContext()
    if (!rpcContext) throw new Error()

    const create = utilizeLookupTable ? createLUTProposal : createProposal
    const proposalAddress = await create(
      rpcContext,
      realm,
      governance.pubkey,
      ownTokenRecord!,
      title,
      description,
      proposalMint,
      selectedGovernance.account.proposalCount,
      instructionsData,
      isDraft,
      ["Approve"],
      client
    )
    queryClient.invalidateQueries({
      queryKey: proposalQueryKeys.all(connection.endpoint),
    })
    return proposalAddress
  }

  const propose = (
    params: Omit<Parameters<typeof handleCreateProposal>[0], 'governance'> & {
      governance: PublicKey
    }
  ) => {
    const { governance, ...rest } = params
    return handleCreateProposal({ ...rest, governance: { pubkey: governance } })
  }

  const proposeMultiChoice = async(
    {
      title,
      description,
      governance,
      instructionsData,
      voteByCouncil = false,
      options,
      isDraft = false,
    }: {
      title: string
      description: string
      governance: PublicKey
      instructionsData: InstructionDataWithHoldUpTime[]
      voteByCouncil?: boolean
      options: string[]
      isDraft?: boolean
    }
  ) => {
    const { result: selectedGovernance } = await fetchGovernanceByPubkey(
      connection.current,
      governance
    )
    if (!selectedGovernance) throw new Error('governance not found')
    if (!realm) throw new Error()

    const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
      selectedGovernance.account.config,
      voteByCouncil
    )

    const defaultProposalMint =
      !mint?.supply.isZero() ||
      config?.account.communityTokenConfig.voterWeightAddin
        ? realm?.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm?.account.config.councilMint
        : undefined

    const proposalMint =
      canChooseWhoVote && voteByCouncil
        ? realm?.account.config.councilMint
        : defaultProposalMint

    if (!proposalMint) {
      throw new Error('There is no suitable governing token for the proposal')
    }
    const rpcContext = getRpcContext()
    if (!rpcContext) throw new Error()

    const proposalAddress = await createProposal(
      rpcContext,
      realm,
      governance,
      ownTokenRecord!,
      title,
      description,
      proposalMint,
      selectedGovernance.account.proposalCount,
      instructionsData,
      isDraft,
      options,
      client
    )
    queryClient.invalidateQueries({
      queryKey: proposalQueryKeys.all(connection.endpoint),
    })
    return proposalAddress
  }

  return { handleCreateProposal, propose, proposeMultiChoice }
}