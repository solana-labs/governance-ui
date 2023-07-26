import { EndpointTypes } from '@models/types'
import { PublicKey } from '@solana/web3.js'
import queryClient from './queryClient'

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
      }`
    )
  return url
}

export const assetProofQueryKeys = {
  all: (cluster: EndpointTypes) => [cluster, 'AssetProof'],
  byAssetId: (cluster: EndpointTypes, k: PublicKey) => [
    ...assetProofQueryKeys.all(cluster),
    'assetId',
    k.toString(),
  ],
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

  const x = await response.json()
  if (x.error) return { found: false, result: undefined, err: x.error }
  return { result: x.result, found: true }
}

export const fetchAssetProofById = (network: Network, assetId: PublicKey) =>
  queryClient.fetchQuery({
    queryKey: assetProofQueryKeys.byAssetId(network, assetId),
    queryFn: () => dasProofByIdQueryFn(network, assetId),
  })
