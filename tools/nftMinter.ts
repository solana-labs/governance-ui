import Arweave from 'arweave'
import {
  CreateNftOutput,
  findMasterEditionV2Pda,
  findMetadataPda,
  Metaplex,
  Nft,
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
import { chunks } from '@utils/helpers'

//Just some shity script to generate verified nfts with same pic x times
//Extracting pure instructions from metaplex to run this with crank was to time consuming so
//recommended use is autoclicker or keypair wallet to approve all transactions its one tx per 1 nft.
const nftNumber = 120

//collection key pk of your created collection that you are the owner and can verify new nfts with this key.
const collectionKeyPk = '3iBYdnzA418tD2o7vm85jBeXgxbdUyXzX9Qfm2XJuKME'

//any img from web.
const nftImgUrl =
  'https://bafkreialxgkg6evd4hhc2awf4cq77vmtkdb3w76ajy2lsoem4afurptlom.ipfs.dweb.link/?ext=jpeg'

//use your own arweave wallet and do not commit your wallet to repo.
const arweaveWalletJson: any = {}

//i just place btn with onclick anywhere in ui to use it.
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
  //read img to blob
  request.open('GET', nftImgUrl, true)
  request.responseType = 'blob'
  request.send()

  request.onload = function () {
    const reader = new FileReader()
    reader.readAsArrayBuffer(request.response)

    reader.onload = async function () {
      //save img of nft to arweave
      const imageUrl = await uploadToArweave(
        arweave,
        reader.result!,
        'image/png'
      )

      //metadata with img url from arweave
      const metadataRequest = JSON.stringify({
        name: 'My_nft',
        description: 'nft_description',
        image: imageUrl,
        properties: {
          category: '',
        },
      })
      //save metadata to arweave
      const metadataUrl = await uploadToArweave(
        arweave,
        metadataRequest,
        'application/json'
      )

      const nftsToVerify: (CreateNftOutput & {
        nft: Nft
      })[] = []

      for (let i = 0; i < nftNumber; i++) {
        try {
          //create nfts
          const mintNFTResponse = await metaplex
            .nfts()
            .create({
              //if you want mint to someone else then the connected wallet you can set owner here.
              //   owner: new PublicKey(
              //     ''
              //   ),
              uri: metadataUrl!,
              sellerFeeBasisPoints: 500,
              name: `nft_nr_${nftNumber}`,
              collection: collectionKeyPk
                ? {
                    //you can't create verified nft right away so setting this to true will throw error.
                    verified: false,
                    key: new PublicKey(collectionKeyPk),
                  }
                : undefined,
            })
            .run()
          console.log(mintNFTResponse)
          nftsToVerify.push(mintNFTResponse)
        } catch (e) {
          console.log(e)
        }
      }

      const verifyInstructions = [
        ...nftsToVerify.map((x) =>
          //to set verified to true you need to run this seperated instruction
          createVerifyCollectionInstruction({
            metadata: findMetadataPda(x.nft.mintAddress),
            collectionAuthority: userWallet.publicKey!,
            payer: userWallet.publicKey!,
            collectionMint: x.nft.collection!.key,
            collection: findMetadataPda(x.nft.collection!.key),
            collectionMasterEditionAccount: findMasterEditionV2Pda(
              x.nft.collection!.key
            ),
          })
        ),
      ]
      const nftsAccountsChunks = chunks(verifyInstructions, 10)
      const signerChunks = Array(nftsAccountsChunks.length).fill([])

      sendTransactionsV2({
        showUiComponent: true,
        connection: connection.current,
        wallet: userWallet,
        TransactionInstructions: [...nftsAccountsChunks].map((x) =>
          transactionInstructionsToTypedInstructionsSets(
            x,
            SequenceType.Parallel
          )
        ),
        signersSet: signerChunks,
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
