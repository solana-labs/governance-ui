import { PublicKey } from '@solana/web3.js'
import { useRealmGovernancesQuery } from './governance'
import { useQuery } from '@tanstack/react-query'
import { useRealmQuery } from './realm'
import { useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import { getNativeTreasuryAddress } from '@solana/spl-governance'
import queryClient from './queryClient'

export const digitalAssetsQueryKeys = {
  all: (endpoint: string) => [endpoint, 'DigitalAssets'],
  byOwner: (endpoint: string, owner: PublicKey) => [
    ...digitalAssetsQueryKeys.all(endpoint),
    'by Owner',
    owner.toString(),
  ],
  byRealm: (endpoint: string, realm: PublicKey) => [
    ...digitalAssetsQueryKeys.all(endpoint),
    'by Realm',
    realm.toString(),
  ],
}

export const useRealmDigitalAssetsQuery = () => {
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result
  const { cluster } = useRouter().query

  const { data: governances } = useRealmGovernancesQuery()

  const enabled = realm !== undefined && governances !== undefined
  const query = useQuery({
    queryKey: enabled
      ? digitalAssetsQueryKeys.byRealm(connection.rpcEndpoint, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const url =
        cluster === 'devnet'
          ? process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC
          : process.env.NEXT_PUBLIC_HELIUS_MAINNET_RPC
      if (url === undefined)
        throw new Error(
          `Helius RPC endpoint not set in env: ${
            cluster === 'devnet'
              ? 'NEXT_PUBLIC_HELIUS_DEVNET_RPC'
              : 'NEXT_PUBLIC_HELIUS_MAINNET_RPC'
          }`
        )

      const treasuries = await Promise.all(
        governances.map((x) => getNativeTreasuryAddress(realm.owner, x.pubkey))
      )
      const governancePks = governances.map((x) => x.pubkey)

      const results = await Promise.all(
        [...treasuries, ...governancePks].map(async (x) => {
          // https://docs.helius.xyz/solana-compression/digital-asset-standard-das-api/get-assets-by-owner
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 'Realms user',
              method: 'getAssetsByOwner',
              params: {
                ownerAddress: x.toString(),
                page: 1, // Starts at 1
                limit: 1000, // TODO support having >1k nfts
              },
            }),
          })
          const { result } = await response.json()
          queryClient.setQueryData(
            digitalAssetsQueryKeys.byOwner(connection.rpcEndpoint, x),
            result.items
          )
          return result.items
        })
      )
      console.log('results', results)
      return results
    },
    enabled,
  })
  return query
}
