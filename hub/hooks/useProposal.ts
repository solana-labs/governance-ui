import { useContext } from 'react';

import { context } from '@hub/providers/Proposal';

/** @deprecated */
export function useProposal() {
  return useContext(context);
}
