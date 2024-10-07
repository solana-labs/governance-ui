import {
  InstructionDataWithHoldUpTime,
  createProposal,
} from 'actions/createProposal'
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
import { useLegacyVoterWeight } from './queries/governancePower'
import {useVotingClients} from "@hooks/useVotingClients";

export default function useCreateProposal() {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { result: ownVoterWeight } = useLegacyVoterWeight()

  const { getRpcContext } = useRpcContext()
  const votingClients = useVotingClients();

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
    const minCouncilTokensToCreateProposal = selectedGovernance?.account.config.minCouncilTokensToCreateProposal
    const councilPower = ownVoterWeight?.councilTokenRecord?.account.governingTokenDepositAmount

    const ownTokenRecord = 
      minCouncilTokensToCreateProposal && councilPower && councilPower >= minCouncilTokensToCreateProposal ?
      ownVoterWeight?.councilTokenRecord : 
      ownVoterWeight?.communityTokenRecord

    if (!ownTokenRecord) throw new Error('token owner record does not exist')
    if (!selectedGovernance) throw new Error('governance not found')
    if (!realm) throw new Error()

    // this is somewhat confusing - the basic idea is:
    // although a vote may be by community vote, the proposer may create it with their council token
    // The choice of which token to use is made when the token record is selected
    const proposeByCouncil = ownVoterWeight?.councilTokenRecord?.pubkey.toBase58() === (ownTokenRecord?.pubkey.toBase58() ?? "");
    // now we can we identify whether we are using the community or council voting client (to decide which (if any) plugins to use)
    const votingClient = votingClients(proposeByCouncil ? 'council' : 'community');

    const defaultProposalMint =
      !mint?.supply.isZero() ||
      config?.account.communityTokenConfig.voterWeightAddin
        ? realm?.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm?.account.config.councilMint
        : undefined

    const proposalMint =
      voteByCouncil
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
      ownTokenRecord,
      title,
      description,
      proposalMint,
      selectedGovernance.account.proposalCount,
      instructionsData,
      isDraft,
      ['Approve'],
      votingClient
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

  const proposeMultiChoice = async ({
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
  }) => {
    const { result: selectedGovernance } = await fetchGovernanceByPubkey(
      connection.current,
      governance
    )

    const minCouncilTokensToCreateProposal = selectedGovernance?.account.config.minCouncilTokensToCreateProposal
    const councilPower = ownVoterWeight?.councilTokenRecord?.account.governingTokenDepositAmount

    const ownTokenRecord = 
      minCouncilTokensToCreateProposal && councilPower && councilPower >= minCouncilTokensToCreateProposal ?
      ownVoterWeight?.councilTokenRecord : 
      ownVoterWeight?.communityTokenRecord

    if (!ownTokenRecord) throw new Error('token owner record does not exist')
    if (!selectedGovernance) throw new Error('governance not found')
    if (!realm) throw new Error()

    // this is somewhat confusing - the basic idea is:
    // although a vote may be by community vote, the proposer may create it with their council token
    // The choice of which token to use is made when the token record is selected
    const proposeByCouncil = ownVoterWeight?.councilTokenRecord?.pubkey.toBase58() === (ownTokenRecord?.pubkey.toBase58() ?? "");
    // now we can we identify whether we are using the community or council voting client (to decide which (if any) plugins to use)
    const votingClient = votingClients(proposeByCouncil ? 'council' : 'community');

    const defaultProposalMint =
      !mint?.supply.isZero() ||
      config?.account.communityTokenConfig.voterWeightAddin
        ? realm?.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm?.account.config.councilMint
        : undefined

    const proposalMint =
      voteByCouncil
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
      ownTokenRecord,
      title,
      description,
      proposalMint,
      selectedGovernance.account.proposalCount,
      instructionsData,
      isDraft,
      options,
      votingClient
    )
    queryClient.invalidateQueries({
      queryKey: proposalQueryKeys.all(connection.endpoint),
    })
    return proposalAddress
  }

  return { handleCreateProposal, propose, proposeMultiChoice }
}
