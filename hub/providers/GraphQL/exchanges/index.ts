import { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';
import { persistedFetchExchange } from '@urql/exchange-persisted-fetch';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { dedupExchange, Exchange } from 'urql';

import { auth } from './auth';
import { graphcache } from './graphcache';

export const exchanges = async (
  jwt: string | null,
  schema?: IntrospectionData,
) => [
  // Ordering matters
  auth,
  dedupExchange,
  requestPolicyExchange({}) as Exchange,
  await graphcache(jwt, schema),
  persistedFetchExchange({ preferGetForPersistedQueries: true }),
  multipartFetchExchange,
];
