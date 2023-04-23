import { findMetadataPda } from '@metaplex-foundation/js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'

export const useTokenMetadata = (
  mint: PublicKey | undefined,
  otherConditions?: boolean
) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = !!mint && !!otherConditions

  const query = useQuery({
    queryFn: async () => {
      const mintPubkey = new PublicKey(mint!)
      const metadataAccount = findMetadataPda(mintPubkey)
      const accountData = await connection.current.getAccountInfo(
        metadataAccount
      )

      const state = Metadata.deserialize(accountData!.data)
      const jsonUri = state[0].data.uri.slice(
        0,
        state[0].data.uri.indexOf('\x00')
      )

      const data = await (await fetch(jsonUri)).json()
      //we dont want unsafe imgs
      return {
        symbol: data.symbol,
        name: data.name,
      }
    },
    enabled,
  })

  return query
}
