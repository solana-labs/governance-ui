import { Connection, PublicKey } from '@solana/web3.js'
import { useRealmGovernancesQuery } from './governance'
import { useQuery } from '@tanstack/react-query'
import { useRealmQuery } from './realm'
import { useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import { getNativeTreasuryAddress } from '@solana/spl-governance'
import queryClient from './queryClient'
import { getNetworkFromEndpoint } from '@utils/connection'

export const digitalAssetsQueryKeys = {
  all: (endpoint: string) => [endpoint, 'DigitalAssets'],
  byId: (endpoint: string, id: PublicKey) => [
    ...digitalAssetsQueryKeys.all(endpoint),
    'by Id',
    id.toString(),
  ],
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

/*** Here is an example item from the DAS Api, since it's not typed and the docs dont give the full schema.
 * {
    "interface": "V1_NFT",
    "id": "9yPMUjM1GpahXpiojwL9jFnVh4622uaqF6KprWRSTWG8",
    "content": {
        "$schema": "https://schema.metaplex.com/nft1.0.json",
        "json_uri": "https://updg8.com/jsondata/CzUyAtJPrz4xSZCntSN84tfbWjaGVftzgcdiDgWUq6qR",
        "files": [
            {
                "uri": "https://updg8.com/imgdata/CzUyAtJPrz4xSZCntSN84tfbWjaGVftzgcdiDgWUq6qR"
            }
        ],
        "metadata": {
            "description": "What's up nerds",
            "name": "Tony with no shirt",
            "symbol": "TONY"
        },
        "links": {
            "image": "https://updg8.com/imgdata/CzUyAtJPrz4xSZCntSN84tfbWjaGVftzgcdiDgWUq6qR"
        }
    },
    "authorities": [
        {
            "address": "2ehTohbzCY9NGVyPktRoJDSNgMLTqtont9uWt5BPaqK2",
            "scopes": [
                "full"
            ]
        }
    ],
    "compression": {
        "eligible": false,
        "compressed": true,
        "data_hash": "6jjJ8EUKDsmbaeBgxXh584zeTdnnLWLi5gAgpxLUwHS8",
        "creator_hash": "7x1C2W4gC2JmJcYvqJpqsjAJJFFuJgedgiQim5hAcWvo",
        "asset_hash": "DUn4acgypJU2aLkW4fUmAcHHGvc4BmAUBvxHKDnSPwde",
        "tree": "8eVM3YWkUjAMMzM57Ysah6wW3wWqdkDwjh536KKrQk3Z",
        "seq": 32,
        "leaf_id": 31
    },
    "grouping": [
        {
            "group_key": "collection",
            "group_value": "CzUyAtJPrz4xSZCntSN84tfbWjaGVftzgcdiDgWUq6qR"
        }
    ],
    "royalty": {
        "royalty_model": "creators",
        "target": null,
        "percent": 0,
        "basis_points": 0,
        "primary_sale_happened": true,
        "locked": false
    },
    "creators": [
        {
            "address": "FMJQkroRvWmypYLGaNdvy9T24J4vpb6kj9KTyjtQhXZ8",
            "share": 100,
            "verified": true
        },
        {
            "address": "5umCoyU1fMDLs6byXAd97xLydarNV4CKWSCBGQyivcjM",
            "share": 0,
            "verified": true
        }
    ],
    "ownership": {
        "frozen": false,
        "delegated": false,
        "delegate": null,
        "ownership_model": "single",
        "owner": "DKdBj8KF9sieWq2XWkZVnRPyDrw9PwAHinkCMvjAkRdZ"
    },
    "supply": {
        "print_max_supply": 0,
        "print_current_supply": 0,
        "edition_nonce": 0
    },
    "mutable": true,
    "burnt": false
}
 */

export const dasByIdQueryFn = async (connection: Connection, id: PublicKey) => {
  const cluster = getNetworkFromEndpoint(connection.rpcEndpoint)
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'Realms user',
      method: 'getAsset',
      params: {
        id: id.toString(),
      },
    }),
  })

  const x = await response.json()
  if (x.error) return { found: false, result: undefined, err: x.error }
  return { result: x.result, found: true }
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
            result.items as any[]
          )
          return result.items as any[]
        })
      )
      console.log('results', results)
      return results
    },
    enabled,
  })
  return query
}
