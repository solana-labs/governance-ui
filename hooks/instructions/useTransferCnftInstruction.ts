import { AccountMeta, Connection, PublicKey } from '@solana/web3.js'
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createTransferInstruction,
} from '@metaplex-foundation/mpl-bubblegum'
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ConcurrentMerkleTreeAccount,
} from '@solana/spl-account-compression'

import {
  fetchDasAssetProofById,
  fetchDigitalAssetById,
} from '@hooks/queries/digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'

export const buildTransferCnftInstruction = async (
  connection: Connection,
  cnftId: PublicKey,
  toOwner: PublicKey
) => {
  {
    const network = getNetworkFromEndpoint(connection.rpcEndpoint)
    if (network === 'localnet') throw new Error()

    const cnft = (await fetchDigitalAssetById(network, cnftId)).result
    if (cnft === undefined) throw new Error('cnft not found')
    if (!cnft.compression.compressed) throw new Error('not a compressed nft')

    const assetId = new PublicKey(cnft.id)
    const { result: assetProof } = await fetchDasAssetProofById(
      network,
      assetId
    )
    if (!assetProof) throw new Error('The asset proof is not found.')

    const treeAddress = new PublicKey(cnft.compression.tree)
    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      connection,
      treeAddress
    )

    const leafOwner = new PublicKey(cnft.ownership.owner)
    const leafDelegate = cnft.ownership?.delegate
      ? new PublicKey(cnft.ownership.delegate)
      : leafOwner

    const treeAuthority = treeAccount.getAuthority()
    const canopyDepth = treeAccount.getCanopyDepth()

    const proofPath: AccountMeta[] = assetProof.proof
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProof.proof.length - (canopyDepth ? canopyDepth : 0))

    const ix = createTransferInstruction(
      {
        merkleTree: treeAddress,
        treeAuthority,
        leafOwner,
        leafDelegate,
        newLeafOwner: toOwner,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        anchorRemainingAccounts: proofPath,
      },
      {
        root: [...new PublicKey(assetProof.root.trim()).toBytes()],
        dataHash: [
          ...new PublicKey(cnft.compression.data_hash.trim()).toBytes(),
        ],
        creatorHash: [
          ...new PublicKey(cnft.compression.creator_hash.trim()).toBytes(),
        ],
        nonce: cnft.compression.leaf_id,
        index: cnft.compression.leaf_id,
      },
      BUBBLEGUM_PROGRAM_ID
    )
    ix.keys.forEach((x) => {
      if (x.pubkey.equals(leafDelegate)) {
        x.isSigner = true
      }
    })
    console.log('cnft ix', ix)

    return ix
  }
}
