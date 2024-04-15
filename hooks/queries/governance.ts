import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getNetworkFromEndpoint } from '@utils/connection'
import asFindable from '@utils/queries/asFindable'
import queryClient from './queryClient'
import {
  Governance,
  getGovernance,
  getGovernanceAccounts,
  pubkeyFilter,
  ProgramAccount,
  VoteThreshold,
  VoteThresholdType,
} from '@solana/spl-governance'
import { fetchRealmByPubkey, useRealmQuery } from './realm'
import { useConnection } from '@solana/wallet-adapter-react'

export const governanceQueryKeys = {
  all: (endpoint: string) => [endpoint, 'Governance'],
  byPubkey: (endpoint: string, k: PublicKey) => [
    ...governanceQueryKeys.all(endpoint),
    k.toString(),
  ],
  byRealm: (endpoint: string, realm: PublicKey) => [
    ...governanceQueryKeys.all(endpoint),
    'by Realm (gPA)',
    realm,
  ],
}

const governanceWithDefaults = (governance: ProgramAccount<Governance>) => {
  const isGovernanceInNeedForDefaultValues =
    governance.account.config.councilVoteThreshold.value === 0 &&
    governance.account.config.councilVoteThreshold.type ===
      VoteThresholdType.YesVotePercentage
  return isGovernanceInNeedForDefaultValues
    ? ({
        ...governance,
        account: {
          ...governance.account,
          config: {
            ...governance.account.config,
            votingCoolOffTime: 0,
            depositExemptProposalCount: 10,
            councilVoteThreshold:
              governance.account.config.communityVoteThreshold,
            councilVetoVoteThreshold:
              governance.account.config.communityVoteThreshold,
            councilVoteTipping: governance.account.config.communityVoteTipping,
            communityVetoVoteThreshold: new VoteThreshold({
              type: VoteThresholdType.Disabled,
            }),
          },
        },
      } as ProgramAccount<Governance>)
    : governance
}

// Note: I may need to insert some defaults from undefined fields here? or maybe the sdk does it already (that would make sense)
export const useGovernanceByPubkeyQuery = (pubkey: PublicKey | undefined) => {
  const { connection } = useConnection()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? governanceQueryKeys.byPubkey(connection.rpcEndpoint, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(() =>
        getGovernance(connection, pubkey).then(governanceWithDefaults)
      )()
    },
    enabled,
  })

  return query
}

const realmGoverancesQueryFn = async (
  connection: Connection,
  realmPk: PublicKey,
  realmOwner: PublicKey
) => {
  const filter = pubkeyFilter(1, realmPk)
  if (!filter) throw new Error() // unclear why this would ever happen, probably it just cannot

  const results = (
    await getGovernanceAccounts(connection, realmOwner, Governance, [filter])
  ).map(governanceWithDefaults)

  results.forEach((x) => {
    queryClient.setQueryData(
      governanceQueryKeys.byPubkey(connection.rpcEndpoint, x.pubkey),
      { found: true, result: x }
    )
  })

  return results
}

export const useRealmGovernancesQuery = () => {
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? governanceQueryKeys.byRealm(connection.rpcEndpoint, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return realmGoverancesQueryFn(connection, realm.pubkey, realm.owner)
    },
    enabled,
  })

  return query
}

export const fetchRealmGovernances = (
  connection: Connection,
  realmPk: PublicKey
) => {
  return queryClient.fetchQuery({
    queryKey: governanceQueryKeys.byRealm(connection.rpcEndpoint, realmPk),
    staleTime: Infinity,
    queryFn: async () => {
      const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
      if (realm === undefined) throw new Error()
      return realmGoverancesQueryFn(connection, realmPk, realm.owner)
    },
  })
}

export const fetchGovernanceByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
  return queryClient.fetchQuery({
    queryKey: governanceQueryKeys.byPubkey(cluster, pubkey),
    queryFn: () =>
      asFindable(() =>
        getGovernance(connection, pubkey).then(governanceWithDefaults)
      )(),
  })
}
