import { NFT_PLUGINS_PKS } from '@constants/plugins'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { ProgramAccount, Proposal, ProposalState } from '@solana/spl-governance'
import { useEffect } from 'react'
import useNftProposalStore from './NftProposalStore'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import { useVotingPop } from '@components/VotePanel/hooks'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import {useNftClient} from "../VoterWeightPlugins/useNftClient";

const NftProposalVoteState = ({
  proposal,
}: {
  proposal?: ProgramAccount<Proposal>
}) => {
  const config = useRealmConfigQuery().data?.result

  const { nftClient } = useNftClient();
  const getCountedNfts = useNftProposalStore((s) => s.getCountedNfts)
  const countedNfts = useNftProposalStore((s) => s.countedNftsForProposal)
  const wallet = useWalletOnePointOh()
  const votingPop = useVotingPop()
  const { totalCalculatedVoterWeight, isReady } = useRealmVoterWeightPlugins(
    votingPop
  )
  const isNftPlugin =
    config?.account.communityTokenConfig.voterWeightAddin &&
    NFT_PLUGINS_PKS.includes(
      config?.account.communityTokenConfig.voterWeightAddin?.toBase58()
    )

  const ownVoteRecord = useProposalVoteRecordQuery('electoral').data?.result

  const showVoteRecords =
    isReady &&
    totalCalculatedVoterWeight?.value &&
    countedNfts.length > 0 &&
    countedNfts.length < totalCalculatedVoterWeight.value.toNumber() &&
    !ownVoteRecord

  const useComponent =
    nftClient &&
    proposal &&
    wallet?.connected &&
    isNftPlugin &&
    wallet.publicKey?.toBase58() &&
    proposal.account.state === ProposalState.Voting

  useEffect(() => {
    if (useComponent) {
      getCountedNfts(nftClient, proposal, wallet.publicKey!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [useComponent])

  return showVoteRecords && useComponent ? (
    <div className="bg-bkg-2 rounded-lg">
      <div className="p-4 md:p-6">
        <h3 className="mb-4">Your NFT voting progress</h3>
        <div className="p-3 rounded-md bg-bkg-1 mb-4">
          <div className="text-fgd-2 mb-0 mr-1.5">Counted NFTS</div>
          <div>{countedNfts.length}</div>
        </div>
        <div className="text-xs">
          Your vote was interrupted and is not cast yet. Please vote again to
          continue.
        </div>
      </div>
    </div>
  ) : null
}

export default NftProposalVoteState
