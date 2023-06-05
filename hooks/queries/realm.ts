import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { getRealm, getRealms } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'

export const realmQueryKeys = {
  all: (cluster: string) => [cluster, 'Realm'],
  byPubkey: (cluster: string, k: PublicKey) => [
    ...realmQueryKeys.all(cluster),
    k.toString(),
  ],
  byProgram: (cluster: string, program: PublicKey) => [
    ...realmQueryKeys.all(cluster),
    'by Program',
    program,
  ],
}

export const useRealmsByProgramQuery = (program: PublicKey) => {
  const connection = useLegacyConnectionContext()

  const enabled = program !== undefined
  const query = useQuery({
    queryKey: enabled
      ? realmQueryKeys.byProgram(connection.cluster, program)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return getRealms(connection.current, program)
    },
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
    enabled,
  })

  return query
}

export const useRealmQuery = () => {
  const connection = useLegacyConnectionContext()
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
