import { ProgramAccount, Proposal } from '@solana/spl-governance'
import { useEffect } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import useNftProposalStore from './NftProposalStore'

const NftProposalVoteState = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>
}) => {
  const plugin = useVotePluginsClientStore((s) => s.state.nftClient)
  const getCountedNfts = useNftProposalStore((s) => s.getCountedNfts)
  const countedNfts = useNftProposalStore((s) => s.countedNftsForProposal)
  const wallet = useWalletStore((s) => s.current)
  useEffect(() => {
    if (plugin && proposal && wallet?.publicKey) {
      getCountedNfts(plugin, proposal, wallet.publicKey)
    }
  }, [plugin, proposal.pubkey.toBase58(), wallet?.publicKey?.toBase58()])

  return <div>{countedNfts.length}</div>
}

export default NftProposalVoteState
