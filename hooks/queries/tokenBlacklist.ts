import { EndpointTypes } from '@models/types'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useWalletStore from 'stores/useWalletStore'

const tokenBlackListUrl =
  'https://raw.githubusercontent.com/solflare-wallet/blocklist-automation/master/dist/blocklist.json'

export const useTokenBlackListKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'TokenBlackList'],
}

export const useTokenBlackList = () => {
  const connection = useWalletStore((s) => s.connection)
  const enabled = connection.cluster
  const query = useQuery({
    queryKey: enabled
      ? useTokenBlackListKeys.all(connection.cluster)
      : undefined,
    queryFn: async () => {
      const resp = await axios.get(tokenBlackListUrl)
      return resp.data as {
        blocklist: string[]
        nftBlocklist: string[]
        whitelist: string[]
        fuzzylist: string[]
        contentHash: string
      }
    },
  })
  return query
}
