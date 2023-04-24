import { findMetadataPda } from '@metaplex-foundation/js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'

const OneHMs = 3600000

export const useTokenMetadata = (
  mint: PublicKey | undefined,
  enableConditions = true
) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = !!mint && !!enableConditions

  const query = useQuery({
    queryFn: async () => {
      const mintPubkey = new PublicKey(mint!)
      const metadataAccount = findMetadataPda(mintPubkey)
      const metadata = await Metadata.fromAccountAddress(
        connection.current,
        metadataAccount
      )
      const jsonUri = metadata.data.uri.slice(
        0,
        metadata.data.uri.indexOf('\x00')
      )

      const data = await (await fetch(jsonUri)).json()
      //Do not use data.img we don't want to have unsafe imgs to show in realms.
      return {
        symbol: data.symbol,
        name: data.name,
      }
    },
    staleTime: OneHMs,
    cacheTime: OneHMs * 24 * 10,
    enabled,
  })

  return query
}
