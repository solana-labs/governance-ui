import { EndpointTypes } from '@models/types'
import {
  TokenOwnerRecord,
  getGovernanceAccounts,
  getTokenOwnerRecord,
  pubkeyFilter,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from './addresses/tokenOwnerRecord'
import { useRealmQuery } from './realm'
import queryClient from './queryClient'
import { useMemo } from 'react'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

export const tokenOwnerRecordQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'TokenOwnerRecord'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...tokenOwnerRecordQueryKeys.all(cluster),
    k.toString(),
  ],
  byRealm: (cluster: EndpointTypes, realm: PublicKey) => [
    ...tokenOwnerRecordQueryKeys.all(cluster),
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
      ? tokenOwnerRecordQueryKeys.byRealm(connection.cluster, realm.pubkey)
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

      results.forEach((x) => {
        queryClient.setQueryData(
          tokenOwnerRecordQueryKeys.byPubkey(connection.cluster, x.pubkey),
          { found: true, result: x }
        )
      })

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

/** @deprecated this hook exists for refactoring legacy code easily -- you should probably not be using it in any new code */
export const useTokenRecordsByOwnersMap = () => {
  const { data: tors } = useTokenOwnerRecordsForRealmQuery()
  const realm = useRealmQuery().data?.result

  const councilMint = realm?.account.config.councilMint
  const councilTORsByOwner = useMemo(
    () =>
      councilMint === undefined || tors === undefined
        ? undefined
        : (Object.fromEntries(
            tors
              .filter((x) => x.account.governingTokenMint.equals(councilMint))
              .map((x) => [x.account.governingTokenOwner.toString(), x])
          ) as Record<string, typeof tors[number]>),
    [councilMint, tors]
  )

  const communityMint = realm?.account.communityMint
  const communityTORsByOwner = useMemo(
    () =>
      communityMint === undefined || tors === undefined
        ? undefined
        : (Object.fromEntries(
            tors
              .filter((x) => x.account.governingTokenMint.equals(communityMint))
              .map((x) => [x.account.governingTokenOwner.toString(), x])
          ) as Record<string, typeof tors[number]>),
    [communityMint, tors]
  )

  // I think this is needed to prevent rerender spam
  return useMemo(() => ({ councilTORsByOwner, communityTORsByOwner }), [
    communityTORsByOwner,
    councilTORsByOwner,
  ])
}

export const useTokenOwnerRecordByPubkeyQuery = (
  pubkey: PublicKey | undefined
) => {
  const connection = useLegacyConnectionContext()
  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenOwnerRecordQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getTokenOwnerRecord)(connection.current, pubkey)
    },
    enabled,
  })
  return query
}

export const useUserCommunityTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CommunityTokenOwner()
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey)
}

export const useUserCouncilTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CouncilTokenOwner()
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey)
}
