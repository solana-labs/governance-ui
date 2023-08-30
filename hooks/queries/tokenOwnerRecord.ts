import {
  TokenOwnerRecord,
  getGovernanceAccounts,
  getTokenOwnerRecord,
  pubkeyFilter,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from './addresses/tokenOwnerRecord'
import { useRealmQuery } from './realm'
import { useMemo } from 'react'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import queryClient from './queryClient'

export const tokenOwnerRecordQueryKeys = {
  all: (endpoint: string) => [endpoint, 'TokenOwnerRecord'],
  byPubkey: (endpoint: string, k: PublicKey) => [
    ...tokenOwnerRecordQueryKeys.all(endpoint),
    k.toString(),
  ],
  byRealm: (endpoint: string, realm: PublicKey) => [
    ...tokenOwnerRecordQueryKeys.all(endpoint),
    'by Realm',
    realm,
  ],
}

export const useTokenOwnerRecordsForRealmQuery = () => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenOwnerRecordQueryKeys.byRealm(
          connection.current.rpcEndpoint,
          realm.pubkey
        )
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const filter = pubkeyFilter(1, realm.pubkey)
      if (!filter) throw new Error() // unclear why this would ever happen, probably it just cannot

      const results = await getGovernanceAccounts(
        connection.current,
        realm.owner,
        TokenOwnerRecord,
        [filter]
      )

      // This may or may not be resource intensive for big DAOs, and is not too useful
      /* 
      results.forEach((x) => {
        queryClient.setQueryData(
          tokenOwnerRecordQueryKeys.byPubkey(connection.cluster, x.pubkey),
          { found: true, result: x }
        )
      }) */

      return results
    },
    enabled,
  })

  return query
}

// TODO filter in the gPA (would need rpc to also index)
export const useTokenOwnerRecordsDelegatedToUser = () => {
  const { data: tors } = useTokenOwnerRecordsForRealmQuery()
  const wallet = useWalletOnePointOh()
  const delagatingTors = useMemo(
    () =>
      tors?.filter(
        (x) =>
          wallet?.publicKey !== undefined &&
          wallet?.publicKey !== null &&
          x.account.governanceDelegate !== undefined &&
          x.account.governanceDelegate.equals(wallet.publicKey)
      ),
    [tors, wallet?.publicKey]
  )

  return delagatingTors
}

const queryFn = (connection: Connection, pubkey: PublicKey) =>
  asFindable(getTokenOwnerRecord)(connection, pubkey)

export const useTokenOwnerRecordByPubkeyQuery = (
  pubkey: PublicKey | undefined
) => {
  const connection = useLegacyConnectionContext()
  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenOwnerRecordQueryKeys.byPubkey(
          connection.current.rpcEndpoint,
          pubkey
        )
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return queryFn(connection.current, pubkey)
    },
    enabled,
  })
  return query
}

export const fetchTokenOwnerRecordByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) =>
  queryClient.fetchQuery({
    queryKey: tokenOwnerRecordQueryKeys.byPubkey(
      connection.rpcEndpoint,
      pubkey
    ),
    queryFn: () => queryFn(connection, pubkey),
  })

export const useUserCommunityTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CommunityTokenOwner()
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey)
}

export const useUserCouncilTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CouncilTokenOwner()
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey)
}
