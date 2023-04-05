import { useContext } from 'react';

import { context } from '@hub/providers/Proposal';

export function useProposal() {
  return useContext(context);
}
