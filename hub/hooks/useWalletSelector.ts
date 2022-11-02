import { useContext } from 'react';

import { context } from '@hub/providers/WalletSelector';

export function useWalletSelector() {
  return useContext(context);
}
