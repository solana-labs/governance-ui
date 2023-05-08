import { EndpointTypes } from '@models/types'
import { getTokenOwnerRecord } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import asFindable from '@utils/queries/asFindable'
import useWalletStore from 'stores/useWalletStore'
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from './addresses/tokenOwnerRecord'

export const tokenOwnerRecordQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'TokenOwnerRecord'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...tokenOwnerRecordQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useTokenOwnerRecordByPubkeyQuery = (pubkey?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)

  const enabled = pubkey !== undefined
  const query = useQuery({
    queryKey: enabled
      ? tokenOwnerRecordQueryKeys.byPubkey(connection.cluster, pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return asFindable(getTokenOwnerRecord)(connection.current, pubkey)
    },
    enabled,
  })

  return query
}

export const useUserCommunityTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CommunityTokenOwner()
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey)
}

export const useUserCouncilTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CouncilTokenOwner()
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey)
}
