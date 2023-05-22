import { findMetadataPda } from '@metaplex-foundation/js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'
import queryClient from './queryClient'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const OneHMs = 3600000

export const tokenMetadataQueryKeys = {
  all: (cluster: string) => [cluster, 'TokenMetadata'],
  byMint: (cluster: string, k: PublicKey) => [
    ...tokenMetadataQueryKeys.all(cluster),
    k,
  ],
  byMints: (cluster: string, k: PublicKey[]) => [
    ...tokenMetadataQueryKeys.all(cluster),
    ...k,
  ],
}

export const useTokenMetadata = (
  mint: PublicKey | undefined,
  enableConditions = true
) => {
  const connection = useLegacyConnectionContext()

  const enabled = !!mint && !!enableConditions

  const query = useQuery({
    queryKey: enabled
      ? tokenMetadataQueryKeys.byMint(connection.cluster, mint)
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
  const connection = useLegacyConnectionContext()

  const enabled = !!mints.length && !!enableConditions

  const query = useQuery({
    queryKey: enabled
      ? tokenMetadataQueryKeys.byMints(connection.cluster, mints)
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

        // we dont want to re-fetch for the individual one
        queryClient.setQueryData(
          tokenMetadataQueryKeys.byMint(connection.cluster, mint),
          metadata.data
        )
      }
      return data
    },
    staleTime: OneHMs,
    cacheTime: OneHMs * 24 * 10,
    enabled,
  })

  return query
}
