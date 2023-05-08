import { EndpointTypes } from '@models/types'
import { getRealm } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { tryParsePublicKey } from '@tools/core/pubkey'
import asFindable from '@utils/queries/asFindable'
import { useRouter } from 'next/router'
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
  const router = useRouter()
  const { symbol } = router.query
  const pubkey = tryParsePublicKey(symbol as string)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? realmQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getRealm)(connection.current, pubkey)
    },
    enabled,
  })

  return query
}
