import useRealm from '@hooks/useRealm'
import { nftPluginsPks } from '@hooks/useVotingPlugins'
import { ProgramAccount, Proposal, ProposalState } from '@solana/spl-governance'
import { useEffect } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import useNftProposalStore from './NftProposalStore'
import useNftPluginStore from './store/nftPluginStore'

const NftProposalVoteState = ({
  proposal,
}: {
  proposal?: ProgramAccount<Proposal>
}) => {
  const { config, ownTokenRecord } = useRealm()
  const { voteRecordsByVoter } = useWalletStore((s) => s.selectedProposal)
  const plugin = useVotePluginsClientStore((s) => s.state.nftClient)
  const getCountedNfts = useNftProposalStore((s) => s.getCountedNfts)
  const countedNfts = useNftProposalStore((s) => s.countedNftsForProposal)
  const wallet = useWalletStore((s) => s.current)
  const votingPower = useNftPluginStore((s) => s.state.votingPower)
  const isNftPlugin =
    config?.account.communityTokenConfig.voterWeightAddin &&
    nftPluginsPks.includes(
      config?.account.communityTokenConfig.voterWeightAddin?.toBase58()
    )

  const ownVoteRecord = ownTokenRecord
    ? voteRecordsByVoter[ownTokenRecord.account.governingTokenOwner.toBase58()]
    : wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()]
  const showVoteRecords =
    countedNfts.length > 0 &&
    countedNfts.length < votingPower.toNumber() &&
    !ownVoteRecord

  const useComponent =
    plugin &&
    proposal &&
    wallet?.connected &&
    isNftPlugin &&
    wallet.publicKey?.toBase58() &&
    proposal.account.state === ProposalState.Voting

  useEffect(() => {
    if (useComponent) {
      getCountedNfts(plugin, proposal, wallet.publicKey!)
    }
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
