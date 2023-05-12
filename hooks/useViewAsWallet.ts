import { getExplorerInspectorUrl } from '@components/explorer/tools'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'

const useViewAsWallet = () => {
  const router = useRouter()
  const { viewAs } = router.query

  const err = () => {
    const msg =
      'not implemented -- you are using a debug feature. remove "viewAs" from the url and try again'
    window.alert(msg)
    throw new Error(msg)
  }

  const connection = useWalletStore((s) => s.connection)

  const signTransaction = useCallback(
    async (transaction: Transaction) => {
      const inspectUrl = await getExplorerInspectorUrl(connection, transaction)
      window.open(inspectUrl, '_blank')
    },
    [connection]
  )

  const wallet = useMemo(
    () =>
      typeof viewAs === 'string'
        ? (({
            publicKey: new PublicKey(viewAs),
            signAllTransactions: (txs: Transaction[]) =>
              txs.forEach(signTransaction),
            signTransaction,
            signMessage: err,
            connected: true,
            connecting: false,
            standard: true,
            readyState: 'Installed',
            icon:
              'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjM0IiB3aWR0aD0iMzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTE9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1MzRiYjEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NTFiZjkiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9Ii41IiB4Mj0iLjUiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii44MiIvPjwvbGluZWFyR3JhZGllbnQ+PGNpcmNsZSBjeD0iMTciIGN5PSIxNyIgZmlsbD0idXJsKCNhKSIgcj0iMTciLz48cGF0aCBkPSJtMjkuMTcwMiAxNy4yMDcxaC0yLjk5NjljMC02LjEwNzQtNC45NjgzLTExLjA1ODE3LTExLjA5NzUtMTEuMDU4MTctNi4wNTMyNSAwLTEwLjk3NDYzIDQuODI5NTctMTEuMDk1MDggMTAuODMyMzctLjEyNDYxIDYuMjA1IDUuNzE3NTIgMTEuNTkzMiAxMS45NDUzOCAxMS41OTMyaC43ODM0YzUuNDkwNiAwIDEyLjg0OTctNC4yODI5IDEzLjk5OTUtOS41MDEzLjIxMjMtLjk2MTktLjU1MDItMS44NjYxLTEuNTM4OC0xLjg2NjF6bS0xOC41NDc5LjI3MjFjMCAuODE2Ny0uNjcwMzggMS40ODQ3LTEuNDkwMDEgMS40ODQ3LS44MTk2NCAwLTEuNDg5OTgtLjY2ODMtMS40ODk5OC0xLjQ4NDd2LTIuNDAxOWMwLS44MTY3LjY3MDM0LTEuNDg0NyAxLjQ4OTk4LTEuNDg0Ny44MTk2MyAwIDEuNDkwMDEuNjY4IDEuNDkwMDEgMS40ODQ3em01LjE3MzggMGMwIC44MTY3LS42NzAzIDEuNDg0Ny0xLjQ4OTkgMS40ODQ3LS44MTk3IDAtMS40OS0uNjY4My0xLjQ5LTEuNDg0N3YtMi40MDE5YzAtLjgxNjcuNjcwNi0xLjQ4NDcgMS40OS0xLjQ4NDcuODE5NiAwIDEuNDg5OS42NjggMS40ODk5IDEuNDg0N3oiIGZpbGw9InVybCgjYikiLz48L3N2Zz4K',
            /* _events: {
            connect: err,
            disconnect: err,
            readyStateChange: err,
          }, */
            connect: err,
            disconnect: err,
            // wallet:
            name: 'Phantom',
            supportedTransactionVersions: new Set([0, 'Legacy']),
            version: '1.0.0',
            url: 'https://github.com/solana-labs/wallet-standard',
            FAKE_DEBUG_WALLET: true,
          } as unknown) as SignerWalletAdapter)
        : undefined,
    [viewAs, signTransaction]
  )

  return wallet
}
export default useViewAsWallet
