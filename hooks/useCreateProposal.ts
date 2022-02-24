import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import useRealm from './useRealm'
import useRpcContext from './useRpcContext'

export default function useCreateProposal() {
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const {
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    canChooseWhoVote,
  } = useRealm()
  const { getRpcContext } = useRpcContext()
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
    governance: ProgramAccount<Governance>
    instructionsData: InstructionDataWithHoldUpTime[]
    voteByCouncil?: boolean
    isDraft?: boolean
  }) => {
    const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
      governance!.account.config
    )
    const defaultProposalMint = !mint?.supply.isZero()
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
    // Fetch governance to get up to date proposalCount
    const selectedGovernance = (await fetchRealmGovernance(
      governance?.pubkey
    )) as ProgramAccount<Governance>
    return await createProposal(
      rpcContext,
      realm!,
      selectedGovernance.pubkey,
      ownTokenRecord!.pubkey,
      title,
      description,
      proposalMint,
      selectedGovernance?.account?.proposalCount,
      instructionsData,
      isDraft,
      client
    )
  }
  return { handleCreateProposal }
}
