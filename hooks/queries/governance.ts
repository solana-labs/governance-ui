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
import { useRealmQuery } from './realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export const governanceQueryKeys = {
  all: (cluster: string) => [cluster, 'Governance'],
  byPubkey: (cluster: string, k: PublicKey) => [
    ...governanceQueryKeys.all(cluster),
    k.toString(),
  ],
  byRealm: (cluster: string, realm: PublicKey) => [
    ...governanceQueryKeys.all(cluster),
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
  const connection = useLegacyConnectionContext()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? governanceQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(() =>
        getGovernance(connection.current, pubkey).then(governanceWithDefaults)
      )()
    },
    enabled,
  })

  return query
}

export const useRealmGovernancesQuery = () => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? governanceQueryKeys.byRealm(connection.cluster, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const filter = pubkeyFilter(1, realm.pubkey)
      if (!filter) throw new Error() // unclear why this would ever happen, probably it just cannot

      const results = (
        await getGovernanceAccounts(
          connection.current,
          realm.owner,
          Governance,
          [filter]
        )
      ).map(governanceWithDefaults)

      results.forEach((x) => {
        queryClient.setQueryData(
          governanceQueryKeys.byPubkey(connection.cluster, x.pubkey),
          { found: true, result: x }
        )
      })

      return results
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
      asFindable(() =>
        getGovernance(connection, pubkey).then(governanceWithDefaults)
      )(),
  })
}
