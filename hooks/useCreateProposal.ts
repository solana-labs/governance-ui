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
import {useVotingClients} from "@hooks/useVotingClients";
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import useRealm from '@hooks/useRealm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import BN from 'bn.js'
import { BigNumber } from 'bignumber.js'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import {
  useTokenOwnerRecordsDelegatedToUser,
  useUserCommunityTokenOwnerRecordByPK, useUserCouncilTokenOwnerRecordByPK
} from '@hooks/queries/tokenOwnerRecord'
import { useSelectedDelegatorStore } from '../stores/useSelectedDelegatorStore'
import { shortenAddress } from '@utils/address'

export default function useCreateProposal() {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  // const { result: ownVoterWeight } = useLegacyVoterWeight()
  const {
    power: communityPower,
    proposer: communityProposer,
  } = useProposeAs('community')
  const { data: communityProposerData } = useUserCommunityTokenOwnerRecordByPK(communityProposer)
  const communityProposerTokenRecord = communityProposerData?.result

  const {
    power: councilPower,
    proposer: councilProposer,
  } = useProposeAs('council')

  const { data: councilProposerData } = useUserCouncilTokenOwnerRecordByPK(councilProposer)
  const councilProposerTokenRecord = councilProposerData?.result

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
    const minCommunityTokensToCreateProposal = selectedGovernance?.account.config.minCommunityTokensToCreateProposal

    const useCouncilPower = minCouncilTokensToCreateProposal && councilPower && councilPower.gte(minCouncilTokensToCreateProposal)
    const ownTokenRecord =
      useCouncilPower ?
      councilProposerTokenRecord :
      communityProposerTokenRecord

    if (!ownTokenRecord) throw new Error('token owner record does not exist')
    if (!selectedGovernance) throw new Error('governance not found')
    if (!realm) throw new Error()

    if (!useCouncilPower && communityPower && minCommunityTokensToCreateProposal && communityPower.lt(minCommunityTokensToCreateProposal)) {
      throw new Error('Not enough voting power')
    }

    // this is somewhat confusing - the basic idea is:
    // although a vote may be by community vote, the proposer may create it with their council token
    // The choice of which token to use is made when the token record is selected
    const proposeByCouncil = councilProposer?.toBase58() === (ownTokenRecord?.pubkey.toBase58() ?? "");
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
    const minCommunityTokensToCreateProposal = selectedGovernance?.account.config.minCommunityTokensToCreateProposal

    const useCouncilPower = minCouncilTokensToCreateProposal && councilPower && councilPower.gte(minCouncilTokensToCreateProposal)
    const ownTokenRecord =
      useCouncilPower ?
      councilProposerTokenRecord :
      communityProposerTokenRecord

    if (!useCouncilPower && communityPower && minCommunityTokensToCreateProposal && communityPower.lt(minCommunityTokensToCreateProposal)) {
      throw new Error('Not enough voting power')
    }

    if (!ownTokenRecord) throw new Error('token owner record does not exist')
    if (!selectedGovernance) throw new Error('governance not found')
    if (!realm) throw new Error()

    // this is somewhat confusing - the basic idea is:
    // although a vote may be by community vote, the proposer may create it with their council token
    // The choice of which token to use is made when the token record is selected
    const proposeByCouncil = councilProposer?.toBase58() === (ownTokenRecord?.pubkey.toBase58() ?? "");
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

const useProposeAs = (
  role: 'community' | 'council',
) => {
  const wallet = useWalletOnePointOh()
  const { voterWeightForWallet, isReady } = useRealmVoterWeightPlugins(role)

  const { councilDelegator, communityDelegator} = useSelectedDelegatorStore()
  const { data: delegatesArray } = useTokenOwnerRecordsDelegatedToUser()


  let proposer = councilDelegator
    ? councilDelegator
    : communityDelegator
    ? communityDelegator
    : wallet?.publicKey || undefined

  let maxPower = proposer ? voterWeightForWallet(proposer)?.value : new BN(0)
  // The user hasn't selected a specific delegator to perform actions as
  // We will use the delegator with the maximum power, or the user's wallet
  if (!councilDelegator && !communityDelegator && delegatesArray) {
    for (const delegator of delegatesArray) {
      const p = voterWeightForWallet(delegator.account.governingTokenOwner)?.value
      if (p && maxPower && p.gt(maxPower)) {
        maxPower = p
        proposer = delegator.account.governingTokenOwner
      }
    }
  }

  return {
    power: maxPower,
    proposer,
    isReady
  }
}

export const useCanCreateProposal = (
  governance?: ProgramAccount<Governance> | null
) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const realm = useRealmQuery().data?.result

  const {
    power: communityPower,
    proposer: communityProposer,
    isReady: communityReady
  } = useProposeAs('community')

  const {
    power: councilPower,
    proposer: councilProposer,
    isReady: councilReady
  } = useProposeAs('council')

  const power = communityPower || councilPower
  const proposer = communityPower ? communityProposer : councilProposer
  const isReady = communityReady && councilReady

  const {
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()


  const minWeightToCreateProposal = (governance?.pubkey == realm?.account.communityMint ?
    governance?.account.config.minCommunityTokensToCreateProposal :
    governance?.account.config.minCouncilTokensToCreateProposal) || undefined

  const hasEnoughVotingPower = power?.gt(minWeightToCreateProposal || new BN(1))

  const canCreateProposal =
    realm &&
    hasEnoughVotingPower &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse

  const minWeightToCreateProposalS = minWeightToCreateProposal
    ? new BigNumber(minWeightToCreateProposal.toString()).toString()
    : "1"

  const error = !connected
    ? 'Connect your wallet to create new proposal'
    : isReady && !communityPower && !councilPower
    ? 'There is no governance configuration to create a new proposal'
    : !hasEnoughVotingPower
    ? `Please select only one account with at least ${minWeightToCreateProposalS} governance power to create a new proposal.`
    : toManyCommunityOutstandingProposalsForUser
    ? 'Too many community outstanding proposals. You need to finalize them before creating a new one.'
    : toManyCouncilOutstandingProposalsForUse
    ? 'Too many council outstanding proposals. You need to finalize them before creating a new one.'
    : ''

  const warning = proposer
    ? `Add a proposal as: ${shortenAddress(proposer.toString())}.`
    : ''

  return {
    canCreateProposal,
    error,
    warning
  }
}
