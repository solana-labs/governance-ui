import { getVoteRecord } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import { useAddressQuery_SelectedProposalVoteRecord } from './addresses/voteRecord'
import queryClient from './queryClient'

export const voteRecordQueryKeys = {
  all: ['VoteRecord'],
  byPubkey: (k: PublicKey) => [...voteRecordQueryKeys.all, k.toString()],
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

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled ? voteRecordQueryKeys.byPubkey(pubkey) : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getVoteRecord)(connection.current, pubkey)
    },
    enabled,
  })

  return query
}

export const fetchVoteRecordByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) =>
  queryClient.fetchQuery({
    queryKey: voteRecordQueryKeys.byPubkey(pubkey),
    queryFn: () => asFindable(getVoteRecord)(connection, pubkey),
  })
