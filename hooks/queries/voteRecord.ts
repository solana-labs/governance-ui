import { EndpointTypes } from '@models/types'
import { getVoteRecord } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import { useAddressQuery_SelectedProposalVoteRecord } from './addresses/voteRecord'
import queryClient from './queryClient'

export const voteRecordQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'VoteRecord'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...voteRecordQueryKeys.all(cluster),
    k.toString(),
  ],
}

// currently unused
export const useVoteRecordByTokenOwnerRecordQuery = (
  tokenOwnerRecordAddress?: PublicKey
) => {
  const pda = useAddressQuery_SelectedProposalVoteRecord(
    tokenOwnerRecordAddress
  )
  const query = useVoteRecordByPubkeyQuery(pda.data)
  return query
}

export const useVoteRecordByPubkeyQuery = (pubkey?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? voteRecordQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getVoteRecord)(connection.current, pubkey)
    },
    enabled,
  })

  return query
}

export const fetchVoteRecordByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: voteRecordQueryKeys.byPubkey(cluster, pubkey),
    queryFn: () => asFindable(getVoteRecord)(connection, pubkey),
  })
}
