import { EndpointTypes } from '@models/types'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import { tryGetMint } from '@utils/tokens'
import useWalletStore from 'stores/useWalletStore'
import queryClient from './queryClient'

export const mintInfoQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'MintInfo'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...mintInfoQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useMintInfoByPubkeyQuery = (pubkey?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? mintInfoQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable((...x: Parameters<typeof tryGetMint>) =>
        tryGetMint(...x).then((x) => x?.account)
      )(connection.current, pubkey)
    },
    enabled,
  })

  return query
}

export const fetchMintInfoByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: mintInfoQueryKeys.byPubkey(cluster, pubkey),
    queryFn: () =>
      asFindable((...x: Parameters<typeof tryGetMint>) =>
        tryGetMint(...x).then((x) => x?.account)
      )(connection, pubkey),
  })
}
