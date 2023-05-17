import { EndpointTypes } from '@models/types'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import { tryGetTokenAccount } from '@utils/tokens'
import useWalletStore from 'stores/useWalletStore'
import queryClient from './queryClient'

export const tokenAccountQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'TokenAccount'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...tokenAccountQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useTokenAccountByPubKeyQuery = (pubkey?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenAccountQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable((...x: Parameters<typeof tryGetTokenAccount>) =>
        tryGetTokenAccount(...x).then((x) => x?.account)
      )(connection.current, pubkey)
    },
    enabled,
  })

  return query
}

export const fetchTokenAccountByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: tokenAccountQueryKeys.byPubkey(cluster, pubkey),
    queryFn: () =>
      asFindable((...x: Parameters<typeof tryGetTokenAccount>) =>
        tryGetTokenAccount(...x).then((x) => x?.account)
      )(connection, pubkey),
  })
}
