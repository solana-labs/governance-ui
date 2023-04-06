import { PublicKey } from '@solana/web3.js';

import devnetList from 'public/realms/devnet.json';
import mainnetList from 'public/realms/mainnet-beta.json';

import { useCluster, ClusterType } from '@hub/hooks/useCluster';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';

export function useRealmPublicKey(id: unknown) {
  const [cluster] = useCluster();

  let publicKey: PublicKey | null = null;

  if (typeof id === 'string') {
    if (cluster.type === ClusterType.Mainnet) {
      for (const item of mainnetList) {
        if (item.symbol.toLowerCase() === id.toLowerCase()) {
          publicKey = new PublicKey(item.realmId);
        }
      }
    }

    if (cluster.type === ClusterType.Devnet) {
      for (const item of devnetList) {
        if (item.symbol.toLowerCase() === id.toLowerCase()) {
          publicKey = new PublicKey(item.realmId);
        }
      }
    }

    if (id.toLowerCase() === 'ecosystem') {
      publicKey = ECOSYSTEM_PAGE;
    }
  }

  if (!publicKey) {
    try {
      publicKey = new PublicKey(id as string);
    } catch {
      throw new Error('Not a valid realm');
    }
  }

  return publicKey;
}
