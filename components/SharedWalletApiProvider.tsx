import { useWallet as useHubsWallet } from '@hub/hooks/useWallet'
import { DEFAULT as HUBS_WALLET_CONTEXT_DEFAULT } from '@hub/providers/Wallet'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { createContext, FC, useContext } from 'react'
import useWalletStore from 'stores/useWalletStore'

export const context = createContext(HUBS_WALLET_CONTEXT_DEFAULT)

type Props = {
  appKind: 'governance' | 'hub'
  children?: React.ReactNode
}

const SharedWalletApiProvider: FC<Props> = ({ appKind, children }) =>
  appKind === 'governance' ? (
    <GovernanceSharedWalletApiProvider>
      {children}
    </GovernanceSharedWalletApiProvider>
  ) : (
    <HubsSharedWalletApiProvider>{children}</HubsSharedWalletApiProvider>
  )

const HubsSharedWalletApiProvider: FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const value = useHubsWallet()
  return <context.Provider value={value}>{children}</context.Provider>
}

const GovernanceSharedWalletApiProvider: FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const wallet = useWalletStore((s) => s.current)

  const value = !wallet
    ? HUBS_WALLET_CONTEXT_DEFAULT
    : {
        ...HUBS_WALLET_CONTEXT_DEFAULT,

        publicKey: wallet.publicKey ?? undefined,
        // It's stupid that TS requires this to be explicitly generically typed >:-(
        signAllTransactions: async <
          T extends Transaction | VersionedTransaction
        >(
          x: T[]
        ) => wallet.signAllTransactions(x),
        signTransaction: async <T extends Transaction | VersionedTransaction>(
          x: T
        ) => wallet.signTransaction(x),
      }

  return <context.Provider value={value}>{children}</context.Provider>
}

export const useSharedWalletApi = () => useContext(context)

export function withSharedWalletApi<P extends JSX.IntrinsicAttributes>(
  Component: React.ComponentType<P>
) {
  const X = (props: P & Pick<Props, 'appKind'>) => (
    <SharedWalletApiProvider appKind={props.appKind}>
      <Component {...props} />
    </SharedWalletApiProvider>
  )
  return X
}

export default SharedWalletApiProvider
