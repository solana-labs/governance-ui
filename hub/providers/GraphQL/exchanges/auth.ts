import { makeOperation } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';

export const auth = authExchange<{ token?: string }>({
  addAuthToOperation: ({ authState, operation }) => {
    const token = authState?.token || localStorage.getItem('user');

    if (!token) {
      return operation;
    }

    const fetchOptions =
      typeof operation.context.fetchOptions === 'function'
        ? operation.context.fetchOptions()
        : operation.context.fetchOptions || {};

    return makeOperation(operation.kind, operation, {
      ...operation.context,
      fetchOptions: {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`,
        },
      },
    });
  },
  getAuth: async ({ authState }) => {
    if (!authState) {
      const token = localStorage.getItem('user');

      if (token) {
        return { token };
      }
    }

    return null;
  },
});
