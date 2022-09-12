import { useContext } from 'react';

import { ClusterType, context } from '@hub/providers/Cluster';

export function useCluster() {
  const value = useContext(context);
  return [value.cluster, value.setType, value.type] as const;
}

export { ClusterType };
