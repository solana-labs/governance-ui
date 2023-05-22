import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { EndpointTypes } from '@models/types'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { fetchDomainsByPubkey } from '@utils/domains'
import useWalletStore from 'stores/useWalletStore'

export const domainQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'Domain'],
  byPubkey: (cluster: EndpointTypes, k: PublicKey) => [
    ...domainQueryKeys.all(cluster),
    k.toString(),
  ],
}

export const useDomainQuery = (pubKey: PublicKey | undefined) => {
  const connection = useLegacyConnectionContext()

  const enabled = pubKey !== undefined

  const query = useQuery({
    queryKey: enabled
      ? domainQueryKeys.byPubkey(connection.cluster, pubKey)
      : undefined,
    queryFn: () => fetchDomainsByPubkey(connection.current, pubKey),
    enabled,
  })

  return query
}
