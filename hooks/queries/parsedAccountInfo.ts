import { EndpointTypes } from '@models/types'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import queryClient from './queryClient'

export const parsedAccountInfoQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'ParsedAccountInfo'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...parsedAccountInfoQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useParsedAccountInfoQuery = (pubkey?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? parsedAccountInfoQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(
        (...x: Parameters<typeof connection.current.getParsedAccountInfo>) =>
          connection.current.getParsedAccountInfo(...x).then((x) => x?.value),
        connection.current
      )(pubkey)
    },
    enabled,
  })

  return query
}

export const fetchParsedAccountInfoByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: parsedAccountInfoQueryKeys.byPubkey(cluster, pubkey),
    queryFn: () =>
      asFindable(
        (...x: Parameters<typeof connection.getParsedAccountInfo>) =>
          connection.getParsedAccountInfo(...x).then((x) => x?.value),
        connection
      )(pubkey),
  })
}
