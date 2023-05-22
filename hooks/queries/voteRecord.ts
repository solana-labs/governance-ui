import { EndpointTypes } from '@models/types'
import {
  VoteRecord,
  getGovernanceAccounts,
  getVoteRecord,
  pubkeyFilter,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import { useAddressQuery_SelectedProposalVoteRecord } from './addresses/voteRecord'
import queryClient from './queryClient'
import { useRealmQuery } from './realm'
import { useVotingPop } from '@components/VotePanel/hooks'
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from './addresses/tokenOwnerRecord'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export const voteRecordQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'VoteRecord'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...voteRecordQueryKeys.all(cluster),
    k.toString(),
  ],
  byRealmXOwner: (
    cluster: EndpointTypes,
    realm: PublicKey,
    owner: PublicKey
  ) => [...voteRecordQueryKeys.all(cluster), realm, owner],
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
  const connection = useLegacyConnectionContext()

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

// doesn't actually filter by realm !
export const useVoteRecordsByOwnerQuery = (owner?: PublicKey) => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  const enabled = owner !== undefined && realm?.pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? voteRecordQueryKeys.byRealmXOwner(
          connection.cluster,
          realm?.pubkey,
          owner
        )
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      const results = await getGovernanceAccounts(
        connection.current,
        realm.owner,
        VoteRecord,
        [pubkeyFilter(33, owner)!]
      )

      // since we got the data for these accounts, lets save it
      results.forEach((x) => {
        queryClient.setQueryData(
          voteRecordQueryKeys.byPubkey(connection.cluster, x.pubkey),
          { found: true, result: x }
        )
      })

      return results
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

export const useProposalVoteRecordQuery = (quorum: 'electoral' | 'veto') => {
  const tokenRole = useVotingPop()
  const community = useAddressQuery_CommunityTokenOwner()
  const council = useAddressQuery_CouncilTokenOwner()

  const electoral =
    tokenRole === undefined
      ? undefined
      : tokenRole === 'community'
      ? community
      : council
  const veto =
    tokenRole === undefined
      ? undefined
      : tokenRole === 'community'
      ? council
      : community

  const selectedTokenRecord = quorum === 'electoral' ? electoral : veto

  const pda = useAddressQuery_SelectedProposalVoteRecord(
    selectedTokenRecord?.data
  )

  return useVoteRecordByPubkeyQuery(pda.data)
}
