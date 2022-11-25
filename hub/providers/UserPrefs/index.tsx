import { createContext, useEffect, useState } from 'react';

import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import { FeedItemSort } from '@hub/types/FeedItemSort';

const LOCAL_STORAGE_KEY = 'userPrefs';

export interface UserPrefs {
  defaultFeedSort: {
    [key: string]: FeedItemSort;
  };
}

interface Value {
  prefs: UserPrefs;
  getFeedSort(key: string): FeedItemSort;
  setFeedSort(key: string, sort: FeedItemSort): void;
}

export const DEFAULT: Value = {
  prefs: { defaultFeedSort: {} },
  getFeedSort: () => {
    throw new Error('Not implemented');
  },
  setFeedSort: () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

interface Props {
  children?: React.ReactNode;
}

export function UserPrefsProvider(props: Props) {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const storedPrefs = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedPrefs) {
          const prefs = JSON.parse(storedPrefs);
          setPrefs(prefs);
        } else {
          setPrefs({
            defaultFeedSort: {},
          });
        }
      } catch {
        setPrefs({
          defaultFeedSort: {},
        });
      }
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined' &&
      prefs
    ) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
    }
  }, [prefs]);

  if (!prefs) {
    return null;
  }

  return (
    <context.Provider
      value={{
        prefs,
        getFeedSort: (key) => {
          return (
            prefs.defaultFeedSort[key] ||
            (key === ECOSYSTEM_PAGE.toBase58()
              ? FeedItemSort.TopAllTime
              : FeedItemSort.Relevance)
          );
        },
        setFeedSort: (key, sort) => {
          setPrefs((cur) => ({
            ...cur,
            defaultFeedSort: {
              ...cur?.defaultFeedSort,
              [key]: sort,
            },
          }));
        },
      }}
    >
      {props.children}
    </context.Provider>
  );
}
