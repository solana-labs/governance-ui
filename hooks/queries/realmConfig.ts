import { getRealmConfig, getRealmConfigAddress } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import { useRealmQuery } from './realm'

export const realmConfigQueryKeys = {
  all: (cluster: string) => [cluster, 'RealmConfig'],
  byRealm: (cluster: string, k: PublicKey) => [
    ...realmConfigQueryKeys.all(cluster),
    'for Realm',
    k,
  ],
}

export const useRealmConfigQuery = () => {
  const connection = useWalletStore((s) => s.connection)
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? realmConfigQueryKeys.byRealm(connection.cluster, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const realmConfigPk = await getRealmConfigAddress(
        realm.owner,
        realm.pubkey
      )
      return asFindable(getRealmConfig)(connection.current, realmConfigPk)
    },
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
    enabled,
  })

  return query
}
