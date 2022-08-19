import type { EndpointTypes } from '@models/types'
import { Connection } from '@solana/web3.js'
import type { EndpointInfo } from '../@types/types'

const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet',
    url:
      process.env.MAINNET_RPC ||
      'http://realms-realms-c335.mainnet.rpcpool.com/258d3727-bb96-409d-abea-0b1b4c48af29/',
  },
  {
    name: 'devnet',
    url: process.env.DEVNET_RPC || 'https://api.dao.devnet.solana.com/',
  },
  {
    name: 'localnet',
    url: 'http://127.0.0.1:8899',
  },
]

console.log('deployed ENDPOINTS:', ENDPOINTS)

export interface ConnectionContext {
  cluster: EndpointTypes
  current: Connection
  endpoint: string
}

export function getConnectionContext(cluster: string): ConnectionContext {
  const ENDPOINT = ENDPOINTS.find((e) => e.name === cluster) || ENDPOINTS[0]
  return {
    cluster: ENDPOINT!.name as EndpointTypes,
    current: new Connection(ENDPOINT!.url, 'recent'),
    endpoint: ENDPOINT!.url,
  }
}

/**
 * Given ConnectionContext, find the network.
 * @param connectionContext
 * @returns EndpointType
 */
export function getNetworkFromEndpoint(endpoint: string) {
  const network = ENDPOINTS.find((e) => e.url === endpoint)
  if (!network) {
    console.log(endpoint, ENDPOINTS)
    throw new Error('Network not found')
  }
  return network?.name
}
