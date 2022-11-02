import { Adapter, WalletReadyState } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider as _WalletProvider,
  useWallet,
  WalletContextState,
} from '@solana/wallet-adapter-react';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import type { PublicKey } from '@solana/web3.js';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import { RealmCircle } from '@hub/components/branding/RealmCircle';
import { SolanaLogo } from '@hub/components/branding/SolanaLogo';
import * as Dialog from '@hub/components/controls/Dialog';
import { useCluster } from '@hub/hooks/useCluster';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';

interface Wallet {
  adapter: Adapter;
  publicKey: PublicKey;
  signMessage: NonNullable<WalletContextState['signMessage']>;
  signTransaction: NonNullable<WalletContextState['signTransaction']>;
}

interface Value {
  getAdapter(): Promise<Wallet>;
}

export const DEFAULT: Value = {
  getAdapter: async () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

let resolveAdapterPromise: ((value: Wallet) => void) | null = null;
const adapterPromise = new Promise<Wallet>((resolve) => {
  resolveAdapterPromise = resolve;
});

interface Props {
  children?: React.ReactNode;
}

function WalletSelectorInner(props: Props) {
  const { wallets, signMessage, signTransaction, select } = useWallet();
  const [adapter, setAdapter] = useState<Adapter | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const adapterName = JSON.parse(
        localStorage.getItem('walletName') || '""',
      );

      const adapter = wallets.find(
        (wallet) => wallet.adapter.name === adapterName,
      )?.adapter;

      if (adapter) {
        setAdapter(adapter);
      }
    }
  }, []);

  useEffect(() => {
    async function connect() {
      if (adapter && shouldConnect) {
        if (
          adapter.connected &&
          adapter.publicKey &&
          signMessage &&
          signTransaction &&
          adapter.publicKey
        ) {
          return adapter.publicKey;
        }

        await adapter.disconnect();
        await adapter.connect();

        let publicKey = adapter.publicKey;

        if (!publicKey) {
          // turn the wallet on and off in an attempt to get the key
          await adapter.disconnect();
          await adapter.connect();
        }

        publicKey = adapter.publicKey;

        if (!publicKey) {
          // if we still don't have the key, something has gone wrong
          throw new Error('No public key');
        }

        select(adapter.name);
        return publicKey;
      }
    }

    connect()
      .then((publicKey) => {
        if (publicKey) {
          setPublicKey(publicKey);
        }
      })
      .catch((e) =>
        toast.publish({
          type: ToastType.Error,
          title: 'Could not connect to wallet',
          message: e instanceof Error ? e.message : 'Something went wrong',
        }),
      );
  }, [adapter, shouldConnect]);

  useEffect(() => {
    if (signMessage && signTransaction && publicKey && adapter) {
      setSelectorOpen(false);

      resolveAdapterPromise?.({
        adapter,
        publicKey,
        signMessage,
        signTransaction,
      });
    }
  }, [signMessage, signTransaction, publicKey, adapter]);

  const adapters = wallets.filter(
    (adapter) =>
      adapter.readyState === WalletReadyState.Installed ||
      adapter.readyState === WalletReadyState.Loadable,
  );

  return (
    <context.Provider
      value={{
        getAdapter: () => {
          setShouldConnect(true);

          if (!adapter) {
            setSelectorOpen(true);
          }

          return adapterPromise;
        },
      }}
    >
      {props.children}
      <Dialog.Root
        open={selectorOpen && !adapter}
        onOpenChange={setSelectorOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay>
            <Dialog.Content className={cx('max-h-[410px]', 'w-[375px]')}>
              <Dialog.Close />
              <div
                className={cx(
                  'flex-col',
                  'flex',
                  'items-center',
                  'px-4',
                  'py-7',
                )}
              >
                <RealmCircle className="h-12 w-12" />
                <Dialog.Title>
                  <div className="flex items-center">
                    <div>Which </div>
                    <SolanaLogo className="h-4 w-4 inline-block align-middle mx-1" />{' '}
                    <div>Solana wallet would</div>
                  </div>
                  <div>you like to use?</div>
                </Dialog.Title>
              </div>
              <Dialog.Description>
                {adapters.map((adapter) => (
                  <button
                    className={cx(
                      'bg-neutral-100',
                      'gap-x-2',
                      'grid',
                      'grid-cols-[24px,1fr,max-content]',
                      'items-center',
                      'mb-1',
                      'px-4',
                      'py-2',
                      'rounded',
                      'transition-colors',
                      'w-full',
                      'hover:bg-neutral-200',
                      'last:mb-4',
                    )}
                    key={adapter.adapter.name}
                    onClick={() => {
                      setSelectorOpen(false);
                      setAdapter(adapter.adapter);
                    }}
                  >
                    <img
                      className="h-6 w-6 inline-block"
                      src={adapter.adapter.icon}
                    />
                    <div className="text-sm text-neutral-900 text-left">
                      {adapter.adapter.name}
                    </div>
                    {adapter.readyState === WalletReadyState.Installed ? (
                      <div className="text-sm text-neutral-500">Installed</div>
                    ) : (
                      <div />
                    )}
                  </button>
                ))}
              </Dialog.Description>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </context.Provider>
  );
}

export function WalletSelector(props: Props) {
  const [cluster] = useCluster();

  const supportedWallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network: cluster.network }),
      new TorusWalletAdapter(),
    ],
    [cluster.network],
  );

  return (
    <ConnectionProvider endpoint={cluster.endpoint}>
      <_WalletProvider wallets={supportedWallets} autoConnect>
        <WalletSelectorInner>{props.children}</WalletSelectorInner>
      </_WalletProvider>
    </ConnectionProvider>
  );
}
