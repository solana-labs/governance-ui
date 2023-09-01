import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { getRealm, getRealms } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import queryClient from './queryClient'
import { useConnection } from '@solana/wallet-adapter-react'

export const realmQueryKeys = {
  all: (endpoint: string) => [endpoint, 'Realm'],
  byPubkey: (endpoint: string, k: PublicKey) => [
    ...realmQueryKeys.all(endpoint),
    k.toString(),
  ],
  byProgram: (endpoint: string, program: PublicKey) => [
    ...realmQueryKeys.all(endpoint),
    'by Program',
    program,
  ],
}

export const useRealmsByProgramQuery = (program: PublicKey) => {
  const { connection } = useConnection()

  const enabled = program !== undefined
  const query = useQuery({
    queryKey: enabled
      ? realmQueryKeys.byProgram(connection.rpcEndpoint, program)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return getRealms(connection, program)
    },
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
    enabled,
  })

  return query
}

export const useRealmQuery = () => {
  const { connection } = useConnection()
  const pubkey = useSelectedRealmPubkey()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? realmQueryKeys.byPubkey(connection.rpcEndpoint, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getRealm)(connection, pubkey)
    },
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
    enabled,
  })

  return query
}

export const fetchRealmByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const endpoint = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: realmQueryKeys.byPubkey(endpoint, pubkey),
    queryFn: () => asFindable(() => getRealm(connection, pubkey))(),
  })
}
