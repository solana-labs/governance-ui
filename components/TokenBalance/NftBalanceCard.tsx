import NFTSelector from '@components/NFTS/NFTSelector'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'

const NftBalanceCard = () => {
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const nftMintRegistrar = useVotePluginsClientStore(
    (s) => s.state.nftMintRegistrar
  )
  const usedCollectionsPks =
    nftMintRegistrar?.collectionConfigs.map((x) => x.collection.toBase58()) ||
    []
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Your NFTS </h3>
      <div className="space-y-4">
        {!connected ? (
          <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
        ) : (
          <NFTSelector
            onNftSelect={() => {
              return null
            }}
            ownerPk={wallet!.publicKey!}
            nftHeight="50px"
            nftWidth="50px"
            selectable={false}
            collectionsPks={usedCollectionsPks}
          ></NFTSelector>
        )}
      </div>
    </div>
  )
}
export default NftBalanceCard
