import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useRealm from './useRealm'
import useRpcContext from './useRpcContext'
import { fetchGovernanceByPubkey } from './queries/governance'
import { PublicKey } from '@solana/web3.js'

export default function useCreateProposal() {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { refetchProposals } = useWalletStore((s) => s.actions)

  const connection = useWalletStore((s) => s.connection)

  const {
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    canChooseWhoVote,
    config,
  } = useRealm()
  const { getRpcContext } = useRpcContext()

  /** @deprecated because the api is goofy, use `propose` */
  const handleCreateProposal = async ({
    title,
    description,
    governance,
    instructionsData,
    voteByCouncil = false,
    isDraft = false,
  }: {
    title: string
    description: string
    governance: { pubkey: PublicKey }
    instructionsData: InstructionDataWithHoldUpTime[]
    voteByCouncil?: boolean
    isDraft?: boolean
  }) => {
    const { result: selectedGovernance } = await fetchGovernanceByPubkey(
      connection.current,
      governance.pubkey
    )
    if (!selectedGovernance) throw new Error('governance not found')

    const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
      selectedGovernance.config,
      voteByCouncil
    )

    const defaultProposalMint =
      !mint?.supply.isZero() ||
      config?.account.communityTokenConfig.voterWeightAddin
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined

    const proposalMint =
      canChooseWhoVote && voteByCouncil
        ? realm!.account.config.councilMint
        : defaultProposalMint

    if (!proposalMint) {
      throw new Error('There is no suitable governing token for the proposal')
    }
    const rpcContext = getRpcContext()

    const proposalAddress = await createProposal(
      rpcContext,
      realm!,
      governance.pubkey,
      ownTokenRecord!,
      title,
      description,
      proposalMint,
      selectedGovernance.proposalCount,
      instructionsData,
      isDraft,
      client
    )
    await refetchProposals()
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

  return { handleCreateProposal, propose }
}
