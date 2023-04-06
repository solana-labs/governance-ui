import { getIntrospectionQuery, IntrospectionQuery } from 'graphql';

export function getGraphqlJsonSchema() {
  if (!process.env.NEXT_PUBLIC_API_ENDPOINT) {
    return Promise.resolve(null);
  }

  return fetch(process.env.NEXT_PUBLIC_API_ENDPOINT || '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variables: {},
      query: getIntrospectionQuery({ descriptions: false }),
    }),
  })
    .then((result) => result.json())
    .then((schema) => schema.data as IntrospectionQuery)
    .catch(() => null);
}
