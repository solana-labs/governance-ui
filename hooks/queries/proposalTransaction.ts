import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'
import {
  ProposalTransaction,
  getGovernanceAccounts,
  pubkeyFilter,
} from '@solana/spl-governance'
import { useRouteProposalQuery } from './proposal'
import { useRealmQuery } from './realm'
import queryClient from './queryClient'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export const proposalTransactionQueryKeys = {
  all: (cluster: string) => [cluster, 'ProposalTransaction'],
  byPubkey: (cluster: string, k: PublicKey) => [
    ...proposalTransactionQueryKeys.all(cluster),
    k,
  ],
  byProposal: (cluster: string, p: PublicKey) => [
    ...proposalTransactionQueryKeys.all(cluster),
    'by Proposal',
    p,
  ],
}

export const useSelectedProposalTransactions = () => {
  const proposal = useRouteProposalQuery().data?.result
  const connection = useLegacyConnectionContext()
  const realm = useRealmQuery().data?.result

  const enabled = realm !== undefined && proposal !== undefined
  const query = useQuery({
    queryKey: enabled
      ? proposalTransactionQueryKeys.byProposal(
          connection.cluster,
          proposal.pubkey
        )
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const results = await getGovernanceAccounts(
        connection.current,
        realm.owner,
        ProposalTransaction,
        [pubkeyFilter(1, proposal.pubkey)!]
      )

      results.forEach((x) => {
        queryClient.setQueryData(
          proposalTransactionQueryKeys.byPubkey(connection.cluster, x.pubkey),
          { found: true, result: x }
        )
      })

      return results
    },
    enabled,
  })

  return query
}
