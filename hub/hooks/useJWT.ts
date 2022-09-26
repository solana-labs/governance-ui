import { useContext } from 'react';

import { context } from '@hub/providers/JWT';

export function useJWT() {
  const value = useContext(context);
  return [value.jwt, value.setJwt] as const;
}
