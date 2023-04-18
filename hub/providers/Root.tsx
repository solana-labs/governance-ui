import * as Tooltip from '@radix-ui/react-tooltip';
import React from 'react';

import cx from '@hub/lib/cx';

import { ClusterProvider } from './Cluster';
import { GraphQLProvider } from './GraphQL';
import { JWTProvider } from './JWT';
import { ProposalProvider } from './Proposal';
import { ToastProvider } from './Toast';
import { UserPrefsProvider } from './UserPrefs';
import { WalletProvider } from './Wallet';

interface Props {
  children: React.ReactNode;
  disableJwts?: boolean;
}

export function RootProvider(props: Props) {
  return (
    <ToastProvider
      className={cx(
        '-translate-x-1/2',
        'flex',
        'items-start',
        'justify-end',
        'left-1/2',
        'max-w-screen-2xl',
        'mt-4',
        'px-4',
      )}
    >
      <JWTProvider disabled={props.disableJwts}>
        <ClusterProvider>
          <WalletProvider>
            <GraphQLProvider>
              <UserPrefsProvider>
                <ProposalProvider>
                  <Tooltip.Provider>{props.children}</Tooltip.Provider>
                </ProposalProvider>
              </UserPrefsProvider>
            </GraphQLProvider>
          </WalletProvider>
        </ClusterProvider>
      </JWTProvider>
    </ToastProvider>
  );
}
