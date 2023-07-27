import { AccountMeta, PublicKey } from '@solana/web3.js'
import { useCallback } from 'react'
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createTransferInstruction,
} from '@metaplex-foundation/mpl-bubblegum'
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ConcurrentMerkleTreeAccount,
} from '@solana/spl-account-compression'

import { fetchDasAssetProofById } from '@hooks/queries/digitalAssets'
import { useConnection } from '@solana/wallet-adapter-react'
import { getNetworkFromEndpoint } from '@utils/connection'

// cnft assetId is the same concept of nft's mintAddress
const useTransferCnftInstruction = (to: PublicKey) => {
  const { connection } = useConnection()
  const network = getNetworkFromEndpoint(connection.rpcEndpoint)

  const enable = network !== 'localnet' && to !== undefined
  return useCallback(
    async (cnft: any) => {
      if (!cnft.compression.compressed || !enable) throw new Error()

      const assetId = new PublicKey(cnft.id)
      const assetProof = await fetchDasAssetProofById(network, assetId)
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

      return createTransferInstruction(
        {
          merkleTree: treeAddress,
          treeAuthority,
          leafOwner,
          leafDelegate,
          newLeafOwner: to,
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
    },
    [connection, to, network, enable]
  )
}

export default useTransferCnftInstruction
