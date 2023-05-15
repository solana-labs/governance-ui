import { findMetadataPda } from '@metaplex-foundation/js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { EndpointTypes } from '@models/types'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'

const OneHMs = 3600000

export const useTokenMetadataKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'tokenMetadata'],
  byMint: (cluster: EndpointTypes, k: PublicKey) => [
    ...useTokenMetadataKeys.all(cluster),
    k.toString(),
  ],
  byMints: (cluster: EndpointTypes, k: PublicKey[]) => [
    ...useTokenMetadataKeys.all(cluster),
    ...k.map((x) => x.toString()),
  ],
}

export const useTokenMetadata = (
  mint: PublicKey | undefined,
  enableConditions = true
) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = !!mint && !!enableConditions

  const query = useQuery({
    queryKey: enabled
      ? useTokenMetadataKeys.byMint(connection.cluster, mint)
      : undefined,
    queryFn: async () => {
      const mintPubkey = new PublicKey(mint!)
      const metadataAccount = findMetadataPda(mintPubkey)
      const metadata = await Metadata.fromAccountAddress(
        connection.current,
        metadataAccount
      )
      //Do not use data.img we don't want to have unsafe imgs to show in realms.
      return {
        symbol: metadata.data.symbol,
        name: metadata.data.name,
      }
    },
    staleTime: OneHMs,
    cacheTime: OneHMs * 24 * 10,
    enabled,
  })

  return query
}

export const useTokensMetadata = (
  mints: PublicKey[],
  enableConditions = true
) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = !!mints.length && !!enableConditions

  const query = useQuery({
    queryKey: enabled
      ? useTokenMetadataKeys.byMints(connection.cluster, mints)
      : undefined,
    queryFn: async () => {
      const data: { symbol: string; name: string; mint: string }[] = []
      for (const mint of mints) {
        const metadataAccount = findMetadataPda(mint)
        const metadata = await Metadata.fromAccountAddress(
          connection.current,
          metadataAccount
        )

        //Do not use data.img we don't want to have unsafe imgs to show in realms.
        data.push({
          mint: mint.toBase58(),
          symbol: metadata.data.symbol,
          name: metadata.data.name,
        })
      }
      return data
    },
    staleTime: OneHMs,
    cacheTime: OneHMs * 24 * 10,
    enabled,
  })

  return query
}
