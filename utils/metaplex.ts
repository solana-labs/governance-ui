import { fetchNFTbyMint } from '@hooks/queries/nft'
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { Connection, PublicKey } from '@solana/web3.js'

export const createIx_transferNft = async (
  connection: Connection,
  wallet: WalletAdapter,
  fromOwner: PublicKey,
  toOwner: PublicKey,
  mint: PublicKey
) => {
  const metaplex = new Metaplex(
    connection
    // surely this doesn't matter? who cares what the cluster is if you know the endpoint?
    /*  {
      cluster:
        connection.en === 'mainnet' ? 'mainnet-beta' : connection.cluster,
     }*/
  ).use(walletAdapterIdentity(wallet))

  const nft = await fetchNFTbyMint(connection, mint)
  if (nft.result) {
    const tokenStandard = nft.result.tokenStandard

    const x = metaplex
      .nfts()
      .builders()
      .transfer({
        nftOrSft: {
          address: mint,
          tokenStandard,
        },
        toOwner,
        fromOwner,
      })

    return x.getInstructions()[0]
  }
}
