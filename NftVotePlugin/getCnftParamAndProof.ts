import { Connection, PublicKey } from '@solana/web3.js'
import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression'
import * as bs58 from 'bs58'
import { fetchDasAssetProofById } from '@hooks/queries/digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import * as anchor from '@coral-xyz/anchor'

export function decode(stuff: string) {
  return bufferToArray(bs58.decode(stuff))
}

function bufferToArray(buffer: Buffer): number[] {
  const nums: number[] = []
  for (let i = 0; i < buffer.length; i++) {
    nums.push(buffer[i])
  }
  return nums
}

/**
 * This is a helper function only for nft-voter-v2 used.
 * Given a cNFT, getCnftParamAndProof will to get its the metadata, leaf information and merkle proof.
 * All these data will be sent to the program to verify the ownership of the cNFT.
 * @param connection
 * @param compressedNft
 * @returns {param, additionalAccounts}
 */
export async function getCnftParamAndProof(
  connection: Connection,
  compressedNft: any
) {
  const network = getNetworkFromEndpoint(connection.rpcEndpoint)
  if (network === 'localnet') throw new Error()
  const { result: assetProof } = await fetchDasAssetProofById(
    network,
    new PublicKey(compressedNft.id)
  )
  const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
    connection,
    new PublicKey(compressedNft.compression.tree)
  )
  const canopyHeight = treeAccount.getCanopyDepth()
  const root = decode(assetProof.root)
  const proofLength = assetProof.proof.length

  const reducedProofs = assetProof.proof.slice(
    0,
    proofLength - (canopyHeight ? canopyHeight : 0)
  )

  const creators = compressedNft.creators.map((creator) => {
    return {
      address: new PublicKey(creator.address),
      verified: creator.verified,
      share: creator.share,
    }
  })

  const rawCollection = compressedNft.grouping.find(
    (x) => x.group_key === 'collection'
  )
  const param = {
    name: compressedNft.content.metadata.name,
    symbol: compressedNft.content.metadata.symbol,
    uri: compressedNft.content.json_uri,
    sellerFeeBasisPoints: compressedNft.royalty.basis_points,
    primarySaleHappened: compressedNft.royalty.primary_sale_happened,
    creators,
    isMutable: compressedNft.mutable,
    editionNonce: compressedNft.supply.edition_nonce,
    collection: {
      key: rawCollection ? new PublicKey(rawCollection.group_value) : null,
      verified: true,
    },
    root,
    leafOwner: new PublicKey(compressedNft.ownership.owner),
    leafDelegate: new PublicKey(
      compressedNft.ownership.delegate || compressedNft.ownership.owner
    ),
    nonce: new anchor.BN(compressedNft.compression.leaf_id),
    index: compressedNft.compression.leaf_id,
    proofLen: reducedProofs.length,
  }

  const additionalAccounts = [compressedNft.compression.tree, ...reducedProofs]

  return { param: param, additionalAccounts: additionalAccounts }
}
