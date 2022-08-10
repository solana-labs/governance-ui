import Arweave from 'arweave'
import {
  findMasterEditionV2Pda,
  findMetadataPda,
  Metaplex,
  walletAdapterIdentity,
} from '@metaplex-foundation/js'
import { ConnectionContext } from '@utils/connection'
import { PublicKey } from '@solana/web3.js'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { createVerifyCollectionInstruction } from '@metaplex-foundation/mpl-token-metadata'
import {
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
} from '@utils/sendTransactions'

const collectionKeyPk = '3iBYdnzA418tD2o7vm85jBeXgxbdUyXzX9Qfm2XJuKME'
const nftImgUrl =
  'https://bafkreialxgkg6evd4hhc2awf4cq77vmtkdb3w76ajy2lsoem4afurptlom.ipfs.dweb.link/?ext=jpeg'

//Do not commit your wallet
const arweaveWalletJson: any = {}

export const generateNft = async (
  connection: ConnectionContext,
  userWallet: SignerWalletAdapter
) => {
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
  })

  const metaplex = new Metaplex(connection.current)
  metaplex.use(walletAdapterIdentity(userWallet))

  const request = new XMLHttpRequest()
  request.open('GET', nftImgUrl, true)
  request.responseType = 'blob'
  request.send()

  request.onload = function () {
    const reader = new FileReader()
    reader.readAsArrayBuffer(request.response)

    reader.onload = async function () {
      const imageUrl = await uploadToArweave(
        arweave,
        reader.result!,
        'image/png'
      )

      const metadataRequest = JSON.stringify({
        name: 'My_bat_nft',
        description: 'bat',
        image: imageUrl,
        properties: {
          category: '',
        },
      })
      const metadataUrl = await uploadToArweave(
        arweave,
        metadataRequest,
        'application/json'
      )
      console.log(imageUrl, metadataUrl)
      const mintNFTResponse = await metaplex
        .nfts()
        .create({
          uri: metadataUrl!,
          sellerFeeBasisPoints: 500,
          name: 'batman_nr_1',
          collection: collectionKeyPk
            ? {
                verified: false,
                key: new PublicKey(collectionKeyPk),
              }
            : undefined,
        })
        .run()

      const ix = createVerifyCollectionInstruction({
        metadata: findMetadataPda(mintNFTResponse.nft.mintAddress),
        collectionAuthority: userWallet.publicKey!,
        payer: userWallet.publicKey!,
        collectionMint: mintNFTResponse.nft.collection!.key,
        collection: findMetadataPda(mintNFTResponse.nft.collection!.key),
        collectionMasterEditionAccount: findMasterEditionV2Pda(
          mintNFTResponse.nft.collection!.key
        ),
      })

      sendTransactionsV2({
        connection: connection.current,
        wallet: userWallet,
        TransactionInstructions: [[ix]].map((x) =>
          transactionInstructionsToTypedInstructionsSets(
            x,
            SequenceType.Sequential
          )
        ),
        signersSet: [[]],
      })
    }
  }
}

const uploadToArweave = async (
  arweave: Arweave,
  data: string | ArrayBuffer | Uint8Array,
  contentType: string
) => {
  const transaction = await arweave.createTransaction({
    data: data,
  })
  transaction.addTag('Content-Type', contentType)

  await arweave.transactions.sign(transaction, arweaveWalletJson)
  await arweave.transactions.post(transaction)

  const id = transaction.id
  const url = id ? `https://arweave.net/${id}` : undefined

  return url
}
