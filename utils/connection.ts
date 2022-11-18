import type { EndpointTypes } from '@models/types';
import { Connection } from '@solana/web3.js';
import type { EndpointInfo } from '../@types/types';

const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet',
    url:
      process.env.MAINNET_RPC ||
       'https://ssc-dao.genesysgo.net',
  },
  {
    name: 'devnet',
    url: process.env.DEVNET_RPC || 'https://api.devnet.solana.com',
  },
  {
    name: 'localnet',
    url: 'http://127.0.0.1:8899',
  },
];

export interface ConnectionContext {
  cluster: EndpointTypes;
  current: Connection;
  endpoint: string;
}

export function getConnectionContext(cluster: string): ConnectionContext {
  const ENDPOINT = ENDPOINTS.find((e) => e.name === cluster) || ENDPOINTS[0];
  return {
    cluster: ENDPOINT!.name as EndpointTypes,
    current: new Connection(ENDPOINT!.url, 'recent'),
    endpoint: ENDPOINT!.url,
  };
}
