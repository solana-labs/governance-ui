import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import { getProposal } from '@solana/spl-governance'
import { useRouteProposalQuery } from './proposal'

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
/* 
export const useSelectedProposalTransactions = () => {
  const proposal = useRouteProposalQuery().data?.result
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? proposalTransactionQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      return asFindable(getProposal)(connection.current, pubkey)
    },
    enabled,
  })

  return query
} */
