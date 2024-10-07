import {
  TokenOwnerRecord,
  getGovernanceAccounts,
  getTokenOwnerRecord,
  pubkeyFilter,
  booleanFilter,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from './addresses/tokenOwnerRecord'
import { useRealmQuery } from './realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import queryClient from './queryClient'
import mainnetBetaRealms from 'public/realms/mainnet-beta.json'
import { determineVotingPowerType } from './governancePower'

export const tokenOwnerRecordQueryKeys = {
  all: (endpoint: string) => [endpoint, 'TokenOwnerRecord'],
  byPubkey: (endpoint: string, k: PublicKey) => [
    ...tokenOwnerRecordQueryKeys.all(endpoint),
    k.toString(),
  ],
  byRealm: (endpoint: string, realm: PublicKey, type: string) => [
    ...tokenOwnerRecordQueryKeys.all(endpoint),
    'by Realm',
    realm.toString(),
    type
  ],
  byRealmXDelegate: (
    endpoint: string,
    realm: PublicKey,
    delegate: PublicKey
  ) => [
    ...tokenOwnerRecordQueryKeys.byRealm(endpoint, realm, 'all'),
    'by Delegate',
    delegate.toString(),
  ],

  byProgramXOwner: (endpoint: string, program: PublicKey, owner: PublicKey) => [
    ...tokenOwnerRecordQueryKeys.all(endpoint),
    'by Program',
    program.toString(),
    'by Owner',
    owner.toString(),
  ],
}

/** does NOT filter by realm */
const fetchTokenOwnerRecordsByRealmByOwner = async (
  connection: Connection,
  program: PublicKey,
  ownerPk: PublicKey
) =>
  queryClient.fetchQuery({
    queryKey: tokenOwnerRecordQueryKeys.byProgramXOwner(
      connection.rpcEndpoint,
      program,
      ownerPk
    ),
    queryFn: async () => {
      const filter = pubkeyFilter(1 + 32 + 32, ownerPk)
      if (!filter) throw new Error() // unclear why this would ever happen, probably it just cannot

      return getGovernanceAccounts(connection, program, TokenOwnerRecord, [
        filter,
      ])
    },
  })

/**
 * CURRENTLY USED ONLY BY DISABLED COMPONENTS
 */
export const fetchTokenOwnerRecordsByOwnerAnyRealm = async (
  connection: Connection,
  ownerPk: PublicKey
) => {
  const programs = [...new Set(mainnetBetaRealms.map((x) => x.programId))].map(
    (x) => new PublicKey(x)
  )
  return (
    await Promise.all(
      programs.map((pk) =>
        fetchTokenOwnerRecordsByRealmByOwner(connection, pk, ownerPk)
      )
    )
  ).flat()
}

export const useTokenOwnerRecordsForRealmQuery = () => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenOwnerRecordQueryKeys.byRealm(
          connection.current.rpcEndpoint,
          realm.pubkey,
          'all'
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

export const useCouncilTokenOwnerRecordsForRealmQuery = () => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenOwnerRecordQueryKeys.byRealm(
          connection.current.rpcEndpoint,
          realm.pubkey,
          'council'
        )
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const filter = pubkeyFilter(1, realm.pubkey)
      if (!filter) throw new Error() // unclear why this would ever happen, probably it just cannot

      const votingType = await determineVotingPowerType(connection.current, realm.pubkey, "community")
      const councilOnly = !(votingType === 'vanilla' || votingType === 'NFT')
      const councilMint = realm.account.config.councilMint

      const mintFilter = councilOnly && councilMint ? 
        pubkeyFilter(33, councilMint) : 
        null

      const results = await getGovernanceAccounts(
        connection.current,
        realm.owner,
        TokenOwnerRecord,
        mintFilter ? [filter, mintFilter] : [filter]
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

// 1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6
// TODO filter in the gPA (would need rpc to also index)
export const useTokenOwnerRecordsDelegatedToUser = () => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()
  const walletPk = wallet?.publicKey ?? undefined
  const enabled = realm !== undefined && walletPk !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenOwnerRecordQueryKeys.byRealmXDelegate(
          connection.current.rpcEndpoint,
          realm.pubkey,
          walletPk
        )
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const realmFilter = pubkeyFilter(1, realm.pubkey)
      const hasDelegateFilter = booleanFilter(
        1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6,
        true
      )
      const delegatedToUserFilter = pubkeyFilter(
        1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6 + 1,
        walletPk
      )
      if (!realmFilter || !delegatedToUserFilter) throw new Error() // unclear why this would ever happen, probably it just cannot

      const results = await getGovernanceAccounts(
        connection.current,
        realm.owner,
        TokenOwnerRecord,
        [realmFilter, hasDelegateFilter, delegatedToUserFilter]
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
