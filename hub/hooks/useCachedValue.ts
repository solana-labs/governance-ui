import { differenceInMilliseconds } from 'date-fns';
import { useEffect, useState } from 'react';

import * as RE from '@hub/types/Result';

interface Node<R> {
  time: number;
  value: R;
}

interface Options {
  ttl?: number;
}

const cache = (() => {
  if (typeof window === 'undefined') {
    return {
      get: <V>(key: string, options?: Options): V | null => null,
      set: <V>(key: string, value: V) => value,
    };
  }

  const cache = new Map<string, Node<any>>();

  return {
    get: <V>(key: string, options?: Options) => {
      const node = cache.get(key) as Node<V> | undefined;
      if (node) {
        if (options?.ttl) {
          if (
            Math.abs(differenceInMilliseconds(Date.now(), node.time)) <
            options.ttl
          ) {
            return node.value;
          }
        } else {
          return node.value;
        }
      }

      return null;
    },
    set: <V>(key: string, value: V) => {
      cache.set(key, {
        value,
        time: Date.now(),
      });
      return value;
    },
  };
})();

export function useCachedValue<
  R,
  F extends (...args: any[]) => Promise<R> = (...args: any[]) => Promise<R>
>(key: string, onFetchValue: F, options?: Options) {
  const cachedValue = cache.get<R>(key, options);
  const [result, setResult] = useState<RE.Result<R>>(
    cachedValue ? RE.stale(cachedValue) : RE.pending(),
  );

  useEffect(() => {
    const value = cache.get<R>(key, options);

    if (value) {
      setResult(RE.stale(value));
    } else {
      onFetchValue()
        .then((value) => {
          setResult(RE.ok(value));
          cache.set(key, value);
        })
        .catch((e) => {
          setResult(RE.failed(e));
        });
    }
  }, [key]);

  return result;
}
