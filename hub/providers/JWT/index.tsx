import { createContext, useCallback, useEffect, useState } from 'react';

import * as gqlStores from '@hub/lib/gqlCacheStorage';

interface Value {
  jwt: null | string;
  setJwt(jwt: null | string): void;
}

export const DEFAULT: Value = {
  jwt: null,
  setJwt: () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

interface Props {
  children: React.ReactNode;
}

export function JWTProvider(props: Props) {
  const [jwt, _setJwt] = useState<string | null>(
    typeof localStorage === 'undefined' ? null : localStorage.getItem('user'),
  );

  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.storageArea === localStorage && event.key === 'user') {
      gqlStores.destroy(event.oldValue);
      _setJwt(event.newValue);
    }
  }, []);

  const setJwt = useCallback(
    (jwt: string | null) => {
      if (typeof localStorage !== 'undefined') {
        if (jwt) {
          localStorage.setItem('user', jwt);
          _setJwt((current) => {
            gqlStores.destroy(current);
            return jwt;
          });
        } else {
          _setJwt((current) => {
            gqlStores.destroy(current);
            return null;
          });
          localStorage.removeItem('user');
        }
      }
    },
    [typeof localStorage],
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      _setJwt(localStorage.getItem('user'));
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  return (
    <context.Provider value={{ jwt, setJwt }}>
      {props.children}
    </context.Provider>
  );
}
