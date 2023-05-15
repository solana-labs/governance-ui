import { EndpointTypes } from '@models/types'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import axios from 'axios'
import useWalletStore from 'stores/useWalletStore'
import queryClient from './queryClient'
import asFindable from '@utils/queries/asFindable'

const ANCHOR_QUERY_PROGRAM_URL = 'https://api.apr.dev/api/v0/program/'
const LIMIT = 5

export const anchorDomainInfoQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'AnchorProgramInfo'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...anchorDomainInfoQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useAnchorProgramInfoQuery = (pubKey: PublicKey | undefined) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubKey !== undefined

  const query = useQuery({
    queryKey: enabled
      ? anchorDomainInfoQueryKeys.byPubkey(connection.cluster, pubKey)
      : undefined,
    queryFn: async () => {
      const apiUrl = `${ANCHOR_QUERY_PROGRAM_URL}${pubKey!.toBase58()}/latest?limit=${LIMIT}`
      const resp = await axios.get(apiUrl)
      return resp
    },
    enabled,
  })

  return query
}

export const fetchAnchorProgramInfoByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: anchorDomainInfoQueryKeys.byPubkey(cluster, pubkey),
    queryFn: () =>
      asFindable(async (x: PublicKey) => {
        const apiUrl = `${ANCHOR_QUERY_PROGRAM_URL}${x!.toBase58()}/latest?limit=${LIMIT}`
        const resp = await axios.get(apiUrl)
        return resp
      })(pubkey),
  })
}
