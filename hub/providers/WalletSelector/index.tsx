import { WalletReadyState } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider as _WalletProvider,
  useWallet,
  WalletContextState,
  Wallet as BaseWallet,
} from '@solana/wallet-adapter-react';
import type { PublicKey } from '@solana/web3.js';
import React, { createContext, useEffect, useMemo, useState } from 'react';

import { RealmCircle } from '@hub/components/branding/RealmCircle';
import { SolanaLogo } from '@hub/components/branding/SolanaLogo';
import * as Dialog from '@hub/components/controls/Dialog';
import { useCluster } from '@hub/hooks/useCluster';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';
import { WALLET_PROVIDERS } from '@utils/wallet-adapters';

interface Wallet {
  publicKey: PublicKey;
  signMessage: NonNullable<WalletContextState['signMessage']>;
  signTransaction: NonNullable<WalletContextState['signTransaction']>;
  signAllTransactions: NonNullable<WalletContextState['signAllTransactions']>;
  wallet: BaseWallet;
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
  const {
    wallets,
    signMessage,
    signTransaction,
    signAllTransactions,
    select,
    wallet,
  } = useWallet();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const adapterName = JSON.parse(
        localStorage.getItem('walletNameV2') || '""',
      );

      const adapter = wallets.find(
        (wallet) => wallet.adapter.name === adapterName,
      )?.adapter;

      if (adapter) {
        select(adapter.name);
      }
    }
  }, []);

  useEffect(() => {
    async function completeConnect() {
      if (wallet && shouldConnect) {
        await wallet.adapter.connect();

        if (wallet.adapter.connected) {
          setPublicKey(wallet.adapter.publicKey);
        }
      }
    }

    completeConnect().catch((e) => {
      console.error(e);

      toast.publish({
        type: ToastType.Error,
        title: 'Could not connect to wallet',
        message: e instanceof Error ? e.message : 'Something went wrong',
      });
    });
  }, [wallet, shouldConnect]);

  useEffect(() => {
    if (signMessage && signTransaction && publicKey && wallet) {
      setSelectorOpen(false);

      resolveAdapterPromise?.({
        publicKey,
        signMessage,
        signTransaction,
        wallet,
        signAllTransactions:
          signAllTransactions ||
          (() => {
            throw new Error('signAllTransactions not available');
          }),
      });
    }
  }, [signMessage, signTransaction, publicKey, wallet]);

  const adapters = wallets.filter(
    (adapter) =>
      adapter.readyState === WalletReadyState.Installed ||
      adapter.readyState === WalletReadyState.NotDetected ||
      adapter.readyState === WalletReadyState.Loadable,
  );

  return (
    <context.Provider
      value={{
        getAdapter: () => {
          setShouldConnect(true);

          if (!wallet) {
            setSelectorOpen(true);
          }

          return adapterPromise;
        },
      }}
    >
      {props.children}
      <Dialog.Root
        open={selectorOpen && !wallet}
        onOpenChange={setSelectorOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay>
            <Dialog.Content className="w-[375px]">
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
                      select(adapter.adapter.name);
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
    () => WALLET_PROVIDERS.map((provider) => provider.adapter),
    [],
  );

  return (
    <ConnectionProvider endpoint={cluster.endpoint}>
      <_WalletProvider wallets={supportedWallets}>
        <WalletSelectorInner>{props.children}</WalletSelectorInner>
      </_WalletProvider>
    </ConnectionProvider>
  );
}
