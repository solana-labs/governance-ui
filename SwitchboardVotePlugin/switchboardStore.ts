import { BN } from '@project-serum/anchor'
import { /*MaxVoterWeightRecord,*/ ProgramAccount } from '@solana/spl-governance'
//import { NFTWithMeta, VotingClient } from '@utils/uiTypes/VotePlugin'
import create, { State } from 'zustand'

interface switchboardPluginStore extends State {
  state: {
    votingPower: BN
    maxVoteRecord: ProgramAccount<MaxVoterWeightRecord> | null
  }
  setVotingNfts: (
    nfts: NFTWithMeta[],
    votingClient: VotingClient,
    nftMintRegistrar: any
  ) => void
  setVotingPower: (nfts: NFTWithMeta[], nftMintRegistrar: any) => void
  setMaxVoterWeight: (
    maxVoterRecord: ProgramAccount<MaxVoterWeightRecord> | null
  ) => void
  setIsLoadingNfts: (val: boolean) => void
}
