import { EndpointTypes } from '@models/types'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import queryClient from './queryClient'
import { getGovernance } from '@solana/spl-governance'

export const governanceQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'Governance'],
  byPubkey: (cluster, k: PublicKey) => [
    ...governanceQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useGovernanceByPubkeyQuery = (pubkey?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? governanceQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable((...x: Parameters<typeof getGovernance>) =>
        getGovernance(...x).then((x) => x?.account)
      )(connection.current, pubkey)
    },
    enabled,
  })

  return query
}

export const fetchGovernanceByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: governanceQueryKeys.byPubkey(cluster, pubkey),
    queryFn: () =>
      asFindable((...x: Parameters<typeof getGovernance>) =>
        getGovernance(...x).then((x) => x?.account)
      )(connection, pubkey),
  })
}
