import useSelectedRealmPubkey from '@hooks/useSelectedRealmPubkey'
import { EndpointTypes } from '@models/types'
import { getRealm } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'

export const realmQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'Realm'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...realmQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useRealmQuery = () => {
  const connection = useWalletStore((s) => s.connection)
  const pubkey = useSelectedRealmPubkey()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? realmQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getRealm)(connection.current, pubkey)
    },
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
    enabled,
  })

  return query
}
