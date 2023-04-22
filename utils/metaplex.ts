import { fetchNFTbyMint } from '@hooks/queries/nft'
import { Metaplex } from '@metaplex-foundation/js'
import { Connection, PublicKey } from '@solana/web3.js'

export const createIx_transferNft = async (
  connection: Connection,
  fromOwner: PublicKey,
  toOwner: PublicKey,
  mint: PublicKey,
  authority: PublicKey,
  payer: PublicKey
) => {
  const metaplex = new Metaplex(
    connection
    // surely this doesn't matter? who cares what the cluster is if you know the endpoint?
    /*  {
      cluster:
        connection.en === 'mainnet' ? 'mainnet-beta' : connection.cluster,
     }*/
  ) //.use(walletAdapterIdentity(wallet)) // surely this doesnt matter either (IT DOES)
  metaplex.identity = () => ({ publicKey: fromOwner } as any) // you need to do this to set payer and authority. I love OOP!!
  // except the payer might not be the same person. great!
  // but if you don't do this, it fails to get the authorization rules
  // not that the authorization rules have anything to do with the identity
  // but you know whatever

  const nft = await fetchNFTbyMint(connection, mint)
  if (!nft.result) throw 'failed to fetch nft'

  const tokenStandard = nft.result.tokenStandard

  const ix = metaplex
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
    .getInstructions()[0]

  ix.keys[9].pubkey = authority
  ix.keys[10].pubkey = payer
  return ix
}
