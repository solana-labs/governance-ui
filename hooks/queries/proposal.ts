import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import {
  getAllProposals,
  getProposal,
  getProposalsByGovernance,
} from '@solana/spl-governance'
import { fetchRealmByPubkey, useRealmQuery } from './realm'
import { useRouter } from 'next/router'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { useMemo } from 'react'
import { useRealmGovernancesQuery } from './governance'
import queryClient from './queryClient'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { HIDDEN_PROPOSALS } from '@components/instructions/tools'

export const proposalQueryKeys = {
  all: (endpoint: string) => [endpoint, 'Proposal'],
  byPubkey: (endpoint: string, k: PublicKey) => [
    ...proposalQueryKeys.all(endpoint),
    k.toString(),
  ],
  byRealm: (endpoint: string, realm: PublicKey) => [
    ...proposalQueryKeys.all(endpoint),
    'by Realm (gPA)',
    realm,
  ],
}

export const useProposalByPubkeyQuery = (pubkey: PublicKey | undefined) => {
  const connection = useLegacyConnectionContext()

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? proposalQueryKeys.byPubkey(connection.endpoint, pubkey)
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

// TODO rename to useSelectedRealmProposalsQuery
export const useRealmProposalsQuery = () => {
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result
  const { data: governances } = useRealmGovernancesQuery()

  const enabled = realm !== undefined && governances !== undefined
  const query = useQuery({
    queryKey: enabled
      ? proposalQueryKeys.byRealm(connection.endpoint, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      console.log('query: fetching realm proposals')

      const results = (
        await Promise.all(
          governances.map((x) =>
            // why not just get all proposals for a realm? what was i doing here?
            getProposalsByGovernance(connection.current, realm.owner, x.pubkey)
          )
        )
      )
        .flat()
        // Blacklisted proposals which should not be displayed in the UI
        // hidden legacy accounts to declutter UI
        .filter((x) => HIDDEN_PROPOSALS.get(x.pubkey.toBase58()) === undefined)

      // TODO instead of using setQueryData, prefetch queries on mouseover ?
      results.forEach((x) => {
        queryClient.setQueryData(
          proposalQueryKeys.byPubkey(connection.endpoint, x.pubkey),
          { found: true, result: x }
        )
      })

      return results
    },
    enabled,
  })

  return query
}

export const useARealmProposalsQuery = (realmPk: PublicKey | undefined) => {
  const connection = useLegacyConnectionContext()

  const enabled = realmPk !== undefined
  return useQuery({
    queryKey: enabled
      ? proposalQueryKeys.byRealm(connection.endpoint, realmPk)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      console.log('query: fetching realm proposals')

      const realm = (await fetchRealmByPubkey(connection.current, realmPk))
        .result
      if (realm === undefined) throw new Error()

      const results = (
        await getAllProposals(connection.current, realm.owner, realmPk)
      ).flat()

      // TODO instead of using setQueryData, prefetch queries on mouseover ?
      results.forEach((x) => {
        queryClient.setQueryData(
          proposalQueryKeys.byPubkey(connection.endpoint, x.pubkey),
          { found: true, result: x }
        )
      })

      return results
    },
    enabled,
  })
}
