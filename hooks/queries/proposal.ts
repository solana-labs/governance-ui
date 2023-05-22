import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import { getProposal, getProposalsByGovernance } from '@solana/spl-governance'
import { useRealmQuery } from './realm'
import { useRouter } from 'next/router'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { useMemo } from 'react'
import { useRealmGovernancesQuery } from './governance'
import queryClient from './queryClient'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export const proposalQueryKeys = {
  all: (cluster: string) => [cluster, 'Proposal'],
  byPubkey: (cluster: string, k: PublicKey) => [
    ...proposalQueryKeys.all(cluster),
    k.toString(),
  ],
  byRealm: (cluster: string, realm: PublicKey) => [
    ...proposalQueryKeys.all(cluster),
    'by Realm (gPA)',
    realm,
  ],
}

export const useProposalByPubkeyQuery = (pubkey?: PublicKey) => {
  const connection = useLegacyConnectionContext()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? proposalQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getProposal)(connection.current, pubkey)
    },
    enabled,
  })

  return query
}

export const useSelectedProposalPk = () => {
  const { pk } = useRouter().query
  return useMemo(
    () => (typeof pk === 'string' ? tryParsePublicKey(pk) : undefined),
    [pk]
  )
}

export const useRouteProposalQuery = () => {
  const proposalPk = useSelectedProposalPk()
  return useProposalByPubkeyQuery(proposalPk)
}

export const useRealmProposalsQuery = () => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const { data: governances } = useRealmGovernancesQuery()

  const enabled = realm !== undefined && governances !== undefined
  const query = useQuery({
    queryKey: enabled
      ? proposalQueryKeys.byRealm(connection.cluster, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const results = (
        await Promise.all(
          governances.map((x) =>
            getProposalsByGovernance(connection.current, realm.owner, x.pubkey)
          )
        )
      ).flat()

      results.forEach((x) => {
        queryClient.setQueryData(
          proposalQueryKeys.byPubkey(connection.cluster, x.pubkey),
          { found: true, result: x }
        )
      })

      return results
    },
    enabled,
  })

  return query
}
