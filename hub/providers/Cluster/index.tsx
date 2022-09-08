import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { createContext, useState } from 'react';

const DEVNET_RPC_ENDPOINT =
  process.env.DEVNET_RPC || 'https://api.dao.devnet.solana.com/';
const MAINNET_RPC_ENDPOINT =
  process.env.MAINNET_RPC ||
  'http://realms-realms-c335.mainnet.rpcpool.com/258d3727-bb96-409d-abea-0b1b4c48af29/';
const TESTNET_RPC_ENDPOINT = 'http://127.0.0.1:8899';

export enum ClusterType {
  Devnet,
  Mainnet,
  Testnet,
}

interface Cluster {
  type: ClusterType;
  connection: Connection;
  endpoint: string;
  network: WalletAdapterNetwork;
  rpcEndpoint: string;
}

export const DevnetCluster: Cluster = {
  type: ClusterType.Devnet,
  connection: new Connection(DEVNET_RPC_ENDPOINT, 'recent'),
  endpoint: clusterApiUrl('devnet'),
  network: WalletAdapterNetwork.Devnet,
  rpcEndpoint: DEVNET_RPC_ENDPOINT,
};

export const MainnetCluster: Cluster = {
  type: ClusterType.Mainnet,
  connection: new Connection(MAINNET_RPC_ENDPOINT, 'recent'),
  endpoint: clusterApiUrl('mainnet-beta'),
  network: WalletAdapterNetwork.Mainnet,
  rpcEndpoint: MAINNET_RPC_ENDPOINT,
};

export const TestnetCluster: Cluster = {
  type: ClusterType.Testnet,
  connection: new Connection(TESTNET_RPC_ENDPOINT, 'recent'),
  endpoint: clusterApiUrl('testnet'),
  network: WalletAdapterNetwork.Testnet,
  rpcEndpoint: TESTNET_RPC_ENDPOINT,
};

interface Value {
  cluster: Cluster;
  type: ClusterType;
  setType(type: ClusterType): void;
}

export const DEFAULT: Value = {
  cluster: DevnetCluster,
  type: ClusterType.Devnet,
  setType: () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

interface Props {
  children: React.ReactNode;
}

export function ClusterProvider(props: Props) {
  const [type, setType] = useState(ClusterType.Mainnet);

  const cluster =
    type === ClusterType.Devnet
      ? DevnetCluster
      : type === ClusterType.Testnet
      ? TestnetCluster
      : MainnetCluster;

  return (
    <context.Provider value={{ cluster, type, setType }}>
      {props.children}
    </context.Provider>
  );
}
