import { PublicKey } from '@solana/web3.js'
import { useRealmGovernancesQuery } from './governance'
import { useQuery } from '@tanstack/react-query'
import { useRealmQuery } from './realm'
import { useConnection } from '@solana/wallet-adapter-react'
import { getNativeTreasuryAddress } from '@solana/spl-governance'
import queryClient from './queryClient'
import { getNetworkFromEndpoint } from '@utils/connection'

type Network = 'devnet' | 'mainnet'
const getHeliusEndpoint = (network: Network) => {
  const url =
    network === 'devnet'
      ? process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC
      : process.env.NEXT_PUBLIC_HELIUS_MAINNET_RPC
  if (url === undefined)
    throw new Error(
      `Helius RPC endpoint not set in env: ${
        network === 'devnet'
          ? 'NEXT_PUBLIC_HELIUS_DEVNET_RPC'
          : 'NEXT_PUBLIC_HELIUS_MAINNET_RPC'
      }`,
    )
  return url
}

export const digitalAssetsQueryKeys = {
  all: (network: Network) => [network, 'DigitalAssets'], // TBH endpoint is stupid for this. it should be either 'devnet' or 'mainnet'.
  byId: (network: Network, id: PublicKey) => [
    ...digitalAssetsQueryKeys.all(network),
    'by Id',
    id.toString(),
  ],
  byOwner: (network: Network, owner: PublicKey) => [
    ...digitalAssetsQueryKeys.all(network),
    'by Owner',
    owner.toString(),
  ],
  byRealm: (network: Network, realm: PublicKey) => [
    ...digitalAssetsQueryKeys.all(network),
    'by Realm',
    realm.toString(),
  ],
  proofById: (network: Network, id: PublicKey) => [
    ...digitalAssetsQueryKeys.all(network),
    'by Owner',
    id.toString(),
  ],
}

export type DasNftObject = {
  grouping: { group_key: 'collection'; group_value: string }[]
  compression: { compressed: boolean }
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

export const dasByIdQueryFn = async (network: Network, id: PublicKey) => {
  const url = getHeliusEndpoint(network)
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

export const useDigitalAssetById = (id: PublicKey | undefined) => {
  const { connection } = useConnection()
  const network = getNetworkFromEndpoint(connection.rpcEndpoint) as Network
  const enabled = id !== undefined
  return useQuery({
    enabled,
    queryKey: id && digitalAssetsQueryKeys.byId(network, id),
    queryFn: async () => {
      if (!enabled) throw new Error()
      return dasByIdQueryFn(network, id)
    },
  })
}

const dasByOwnerQueryFn = async (network: Network, owner: PublicKey) => {
  const url = getHeliusEndpoint(network)

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
        ownerAddress: owner.toString(),
        page: 1, // Starts at 1
        limit: 1000, // TODO support having >1k nfts
      },
    }),
  })
  const { result } = await response.json()
  return result.items as any[]
}

const dasProofByIdQueryFn = async (network: Network, id: PublicKey) => {
  const url = getHeliusEndpoint(network)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'Realms user',
      method: 'getAssetProof',
      params: {
        id: id.toString(),
      },
    }),
  })

  const { result, error } = await response.json()
  if (error) return undefined
  return result.items as any
}

export const fetchDigitalAssetsByOwner = (network: Network, owner: PublicKey) =>
  queryClient.fetchQuery({
    queryKey: digitalAssetsQueryKeys.byOwner(network, owner),
    queryFn: () => dasByOwnerQueryFn(network, owner),
  })

export const useDigitalAssetsByOwner = (owner: undefined | PublicKey) => {
  const { connection } = useConnection()
  const network = getNetworkFromEndpoint(connection.rpcEndpoint) as Network
  const enabled = owner !== undefined
  return useQuery({
    enabled,
    queryKey: owner && digitalAssetsQueryKeys.byOwner(network, owner),
    queryFn: async () => {
      if (!enabled) throw new Error()
      return dasByOwnerQueryFn(network, owner)
    },
  })
}

export const fetchDasAssetProofById = (network: Network, assetId: PublicKey) =>
  queryClient.fetchQuery({
    queryKey: digitalAssetsQueryKeys.proofById(network, assetId),
    queryFn: () => dasProofByIdQueryFn(network, assetId),
  })

export const useRealmDigitalAssetsQuery = () => {
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result
  const network = getNetworkFromEndpoint(connection.rpcEndpoint) as Network

  const { data: governances } = useRealmGovernancesQuery()

  const enabled = realm !== undefined && governances !== undefined
  const query = useQuery({
    queryKey: enabled
      ? digitalAssetsQueryKeys.byRealm(network, realm.pubkey)
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      const treasuries = await Promise.all(
        governances.map((x) => getNativeTreasuryAddress(realm.owner, x.pubkey)),
      )
      const governancePks = governances.map((x) => x.pubkey)

      const results = await Promise.all(
        [...treasuries, ...governancePks].map((x) =>
          fetchDigitalAssetsByOwner(network, x),
        ),
      )
      console.log('results', results)
      return results
    },
    enabled,
  })
  return query
}
