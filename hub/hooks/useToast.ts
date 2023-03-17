import { useContext } from 'react';

import { context, ToastType } from '@hub/providers/Toast';

export function useToast() {
  const value = useContext(context);
  return { publish: value.publish };
}

export { ToastType };
