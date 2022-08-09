import * as fs from 'fs'
import Arweave from 'arweave'
import { Metaplex } from '@metaplex-foundation/js'
import { ConnectionContext } from '@utils/connection'
import { PublicKey } from '@solana/web3.js'

export const generateNft = async (
  connection: ConnectionContext,
  wallet: any
) => {
  const imgSrc = './batman-small.jpeg'
  //const nftToMint = 60
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
  })
  const collectionKey = '3iBYdnzA418tD2o7vm85jBeXgxbdUyXzX9Qfm2XJuKME'

  const metaplex = new Metaplex(connection.current)
  // 1. Upload image to Arweave
  const data = fs.readFileSync(imgSrc)

  const transaction = await arweave.createTransaction({
    data: data,
  })

  transaction.addTag('Content-Type', 'image/png')
  await arweave.transactions.sign(transaction, wallet)

  const response = await arweave.transactions.post(transaction)
  console.log(response)

  const id = transaction.id
  const imageUrl = id ? `https://arweave.net/${id}` : undefined

  // 2. Upload metadata to Arweave

  const mintNFTResponse = await metaplex
    .nfts()
    .create({
      uri: imageUrl!,
      sellerFeeBasisPoints: 500,
      name: 'batman_nr',
      collection: collectionKey
        ? {
            verified: false,
            key: new PublicKey(collectionKey),
          }
        : undefined,
    })
    .run()
  console.log(mintNFTResponse)
}
