import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getOwnedTokenAccounts } from '@utils/tokens'
import queryClient from './queryClient'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export const tokenAccountQueryKeys = {
  all: (cluster: string) => [cluster, 'TokenAccount'],
  byPubkey: (cluster: string, k: PublicKey) => [
    ...tokenAccountQueryKeys.all(cluster),
    k.toString(),
  ],
  byOwner: (cluster: string, o: PublicKey) => [
    ...tokenAccountQueryKeys.all(cluster),
    'by Owner',
    o.toString(),
  ],
}

export const useTokenAccountsByOwnerQuery = (pubkey?: PublicKey) => {
  const connection = useLegacyConnectionContext()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenAccountQueryKeys.byOwner(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      const results = await getOwnedTokenAccounts(connection.current, pubkey)

      // since we got the data for these accounts, lets save it
      results.forEach((x) => {
        queryClient.setQueryData(
          tokenAccountQueryKeys.byPubkey(connection.cluster, x.publicKey),
          { found: true, result: x }
        )
      })

      return results
    },
    enabled,
  })

  return query
}
