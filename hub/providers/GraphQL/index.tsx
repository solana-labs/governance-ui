import { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';
import React, { useEffect, useState } from 'react';
import { createClient, Client, Provider, Exchange } from 'urql';

import { useJWT } from '@hub/hooks/useJWT';

import { exchanges } from './exchanges';

const urqlClient = async (jwt: string | null, schema?: IntrospectionData) => {
  return createClient({
    exchanges: (await exchanges(jwt, schema)) as Exchange[],
    url: process.env.NEXT_PUBLIC_API_ENDPOINT || '',
  });
};

interface Props {
  children?: React.ReactNode;
}

export function GraphQLProvider(props: Props) {
  const [jwt] = useJWT();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const schema =
      typeof window !== 'undefined'
        ? // @ts-ignore
          window['__SCHEMA__']
        : undefined;

    setClient(null);
    urqlClient(jwt, schema).then(setClient);
  }, [jwt]);

  if (!client) {
    return null;
  }

  return <Provider value={client}>{props.children}</Provider>;
}
