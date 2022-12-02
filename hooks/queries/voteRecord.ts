import { getVoteRecord } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'
import { useAddressQuery_SelectedProposalVoteRecord } from './addresses/voteRecord'
import queryClient from './queryClient'

export const voteRecordQueryKeys = {
  byPubkey: (k: PublicKey) => ['VoteRecord', k.toString()],
}

// currently unused
export const useVoteRecordByTokenOwnerRecordQuery = (
  tokenOwnerRecordAddress?: PublicKey
) => {
  const pda = useAddressQuery_SelectedProposalVoteRecord(
    tokenOwnerRecordAddress
  )
  const query = useVoteRecordByPubkeyQuery(pda.data)
  return query
}

export const useVoteRecordByPubkeyQuery = (pubkey?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

  const query = useQuery({
    queryKey: voteRecordQueryKeys.byPubkey(pubkey!),
    queryFn: () => getVoteRecord(connection.current, pubkey!),
    enabled: pubkey !== undefined,
    staleTime: Number.MAX_SAFE_INTEGER,
  })

  return query
}

export const fetchVoteRecordByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) =>
  queryClient.fetchQuery({
    queryKey: voteRecordQueryKeys.byPubkey(pubkey),
    queryFn: () => getVoteRecord(connection, pubkey),
  })
