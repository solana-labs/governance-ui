import create, { State } from 'zustand'
import { NftVoterClient } from '@solana/governance-program-library'
import { ProgramAccount, Proposal } from '@solana/spl-governance'
import { getUsedNftsForProposal, NftVoteRecord } from './accounts'
import { PublicKey } from '@solana/web3.js'

interface NftProposalStore extends State {
  proposal: ProgramAccount<Proposal> | null
  countedNftsForProposal: NftVoteRecord[]
  votingInProgress: boolean
  getCountedNfts: (
    client: NftVoterClient,
    proposal: ProgramAccount<Proposal>,
    connectedWallet: PublicKey
  ) => void
  openNftVotingCountingModal: () => void
  closeNftVotingCountingModal: () => void
}

const compactDefaultState = {
  proposal: null,
  countedNftsForProposal: [],
  votingInProgress: false,
}

const useNftProposalStore = create<NftProposalStore>((set, _get) => ({
  ...compactDefaultState,
  getCountedNfts: async (client, proposal, connectedWallet) => {
    const countedNfts = await getUsedNftsForProposal(client!, proposal.pubkey!)
    set((s) => {
      s.proposal = proposal
      s.countedNftsForProposal = countedNfts.filter(
        (x) =>
          x.account.governingTokenOwner.toBase58() ===
          connectedWallet.toBase58()
      )
    })
  },
  openNftVotingCountingModal: () => {
    set((s) => {
      s.votingInProgress = true
    })
  },
  closeNftVotingCountingModal: () => {
    set((s) => {
      s.votingInProgress = false
    })
  },
}))

export default useNftProposalStore
