import { EndpointTypes } from '@models/types'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import { Metaplex } from '@metaplex-foundation/js'
import { getNetworkFromEndpoint } from '@utils/connection'
import queryClient from './queryClient'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { useDigitalAssetsByOwner } from './digitalAssets'
import { useConnection } from '@solana/wallet-adapter-react'
import { filterAndMapVerifiedCollections } from '@components/NewRealmWizard/components/steps/AddNFTCollectionForm'
import axios from 'axios'

export const nftQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'NFT'],
  byMint: (cluster: EndpointTypes, k: PublicKey) => [
    ...nftQueryKeys.all(cluster),
    'mint',
    k.toString(),
  ],
}

export const useNFTbyMintQuery = (pubkey: PublicKey | undefined) => {
  const connection = useLegacyConnectionContext()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? nftQueryKeys.byMint(connection.cluster, pubkey)
      : undefined,
    queryFn: () => {
      if (!enabled) throw new Error()
      const metaplex = new Metaplex(connection.current, {
        cluster:
          connection.cluster === 'mainnet'
            ? 'mainnet-beta'
            : connection.cluster,
      })

      return asFindable(metaplex.nfts().findByMint)({ mintAddress: pubkey })
    },
    enabled,
  })

  return query
}

export const fetchNFTbyMint = (connection: Connection, pubkey: PublicKey) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: nftQueryKeys.byMint(cluster, pubkey),
    queryFn: () => {
      const metaplex = new Metaplex(connection, {
        cluster: cluster === 'mainnet' ? 'mainnet-beta' : cluster,
      })

      // this might look stupid but is actually necessary for some ungodly reason
      const f = (x: PublicKey) => metaplex.nfts().findByMint({ mintAddress: x })

      return asFindable(f)(pubkey)
    },
  })
}

export const useOwnerVerifiedCollectionsQuery = (owner: PublicKey) => {
  const { connection } = useConnection()
  const { data: ownedNfts } = useDigitalAssetsByOwner(owner)
  const network = getNetworkFromEndpoint(connection.rpcEndpoint)
  const verifiedNfts = filterAndMapVerifiedCollections(ownedNfts)

  const enabled = owner !== undefined && ownedNfts !== undefined
  const query = useQuery({
    queryKey: enabled ? nftQueryKeys.byMint(network, owner) : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const verifiedCollections = {}
      for (const collectionKey in verifiedNfts) {
        const collectionInfo = await fetchNFTbyMint(
          connection,
          new PublicKey(collectionKey)
        )

        if (collectionInfo.result !== undefined) {
          const { data: response } = await axios.get(collectionInfo.result.uri)
          verifiedCollections[collectionKey] = {
            ...collectionInfo.result,
            ...response,
            collectionMintAddress: collectionKey,
            nfts: verifiedNfts[collectionKey],
          }
        }
      }

      return verifiedCollections
    },
    enabled,
  })
  return query
}
