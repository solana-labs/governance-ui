import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import { getProposal } from '@solana/spl-governance'
import { useRealmQuery } from './realm'

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
  const connection = useWalletStore((s) => s.connection)

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

export const useRealmProposalsQuery = () => {
  const connection = useWalletStore((s) => s.connection)
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined
  const query = useQuery({
    queryKey: enabled
      ? proposalQueryKeys.byRealm(connection.cluster, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      /* 
      const filter = pubkeyFilter(1, realm.pubkey)
      if (!filter) throw new Error() // unclear why this would ever happen, probably it just cannot

      const results = await getGovernanceAccounts(
        connection.current,
        realm.owner,
        Governance,
        [filter]
      )

      results.forEach((x) => {
        queryClient.setQueryData(
          proposalQueryKeys.byPubkey(connection.cluster, x.pubkey),
          { found: true, result: x }
        )
      })

      return results */
    },
    enabled,
  })

  return query
}
