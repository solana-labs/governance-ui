import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useRealm from './useRealm'
import useRpcContext from './useRpcContext'

export default function useCreateProposal() {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { fetchRealmGovernance, refetchProposals } = useWalletStore(
    (s) => s.actions
  )
  const {
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    canChooseWhoVote,
    config,
  } = useRealm()
  console.log("In Proposal Hook. Mint:");
  console.log(mint);
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

    /*const defaultProposalMint =
      !mint?.supply.isZero() ||
      realm?.account.config.useMaxCommunityVoterWeightAddin ||
      (realm?.account.config.useCommunityVoterWeightAddin &&
        client.clientType === 3)
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined*/

    const defaultProposalMint =
      !mint?.supply.isZero() ||
      realm?.account.config.useMaxCommunityVoterWeightAddin ||
      true
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined
    console.log("Ah it's this part.");
    console.log(`da community mint is ${defaultProposalMint.toBase58()}`);
    console.log(`da realm mint is ${realm.account.communityMint.toBase58()}`);
    //console.log(`da mint ${mint.publicKey.toBase58()}`);

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
    console.log("Own token record... you're undefined, aren't ya???");
    console.log(ownTokenRecord);
    const proposalAddress = await createProposal(
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
    await refetchProposals()
    return proposalAddress
  }
  return { handleCreateProposal }
}
