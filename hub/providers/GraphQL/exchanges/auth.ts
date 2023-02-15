import { makeOperation } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';

export const auth = authExchange<{ token?: string; cluster?: string }>({
  addAuthToOperation: ({ authState, operation }) => {
    const token = authState?.token || localStorage.getItem('user');

    let enchancedOperation = operation;

    if (authState?.cluster === 'devnet') {
      const fetchOptions =
        typeof enchancedOperation.context.fetchOptions === 'function'
          ? enchancedOperation.context.fetchOptions()
          : enchancedOperation.context.fetchOptions || {};

      enchancedOperation = makeOperation(
        enchancedOperation.kind,
        enchancedOperation,
        {
          ...enchancedOperation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'x-environment': 'devnet',
            },
          },
        },
      );
    }

    if (token) {
      const fetchOptions =
        typeof enchancedOperation.context.fetchOptions === 'function'
          ? enchancedOperation.context.fetchOptions()
          : enchancedOperation.context.fetchOptions || {};

      enchancedOperation = makeOperation(
        enchancedOperation.kind,
        enchancedOperation,
        {
          ...enchancedOperation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              Authorization: `Bearer ${token}`,
            },
          },
        },
      );
    }

    return enchancedOperation;
  },
  getAuth: async ({ authState }) => {
    if (!authState) {
      const token = localStorage.getItem('user') || undefined;
      const cluster = location.search.includes('cluster=devnet')
        ? 'devnet'
        : undefined;

      if (token || cluster) {
        return { cluster, token };
      }
    }

    return null;
  },
});
