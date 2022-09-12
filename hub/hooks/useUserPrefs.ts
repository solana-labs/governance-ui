import { useContext } from 'react';

import { context } from '@hub/providers/UserPrefs';

export function useUserPrefs() {
  return useContext(context);
}
