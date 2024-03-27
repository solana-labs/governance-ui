import {
  GovernanceAccountType,
  GoverningTokenType,
  RealmConfigAccount,
  getRealmConfig,
  getRealmConfigAddress,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import { fetchRealmByPubkey, useRealmQuery } from './realm'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { useConnection } from '@solana/wallet-adapter-react'
import queryClient from './queryClient'

export const realmConfigQueryKeys = {
  all: (endpoint: string) => [endpoint, 'RealmConfig'],
  byRealm: (endpoint: string, k: PublicKey) => [
    ...realmConfigQueryKeys.all(endpoint),
    'for Realm',
    k,
  ],
}

export const useRealmConfigQuery = () => {
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result
  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? realmConfigQueryKeys.byRealm(connection.rpcEndpoint, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const realmConfigPk = await getRealmConfigAddress(
        realm.owner,
        realm.pubkey
      )

      return asFindable(getRealmConfig)(connection, realmConfigPk)
    },
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
    enabled,
  })

  return query
}

export const fetchRealmConfigQuery = async (
  connection: Connection,
  realmPk: PublicKey
) =>
  queryClient.fetchQuery({
    queryKey: realmConfigQueryKeys.byRealm(connection.rpcEndpoint, realmPk),
    queryFn: async () => {
      const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
      if (realm === undefined) throw new Error()

      const realmConfigPk = await getRealmConfigAddress(
        realm.owner,
        realm.pubkey
      )
      return asFindable(getRealmConfig)(connection, realmConfigPk)
    },
  })

const DEFAULT_CONFIG_FOR_REALM = (realm: PublicKey): RealmConfigAccount => ({
  accountType: GovernanceAccountType.RealmConfig,
  realm,
  communityTokenConfig: {
    voterWeightAddin: undefined,
    maxVoterWeightAddin: undefined,
    tokenType: GoverningTokenType.Liquid,
    reserved: new Uint8Array(),
  },
  councilTokenConfig: {
    voterWeightAddin: undefined,
    maxVoterWeightAddin: undefined,
    tokenType: GoverningTokenType.Liquid,
    reserved: new Uint8Array(),
  },
  reserved: new Uint8Array(),
})

/** There may be no RealmConfigAccount for the DAO, in which case the program just uses defaults */
export const useEffectiveRealmConfig = () => {
  const { data: configResult } = useRealmConfigQuery()
  const realmPk = useSelectedRealmPubkey()
  return configResult === undefined
    ? undefined
    : configResult.result === undefined
    ? realmPk
      ? DEFAULT_CONFIG_FOR_REALM(realmPk)
      : undefined
    : configResult.result.account
}
