import { useEffect, useMemo, useState } from 'react'

import useWalletStore from '../stores/useWalletStore'
import { notify } from '../utils/notifications'
import {
  DEFAULT_PROVIDER,
  getWalletProviderByUrl,
} from '../utils/wallet-adapters'

import useInterval from './useInterval'
import useLocalStorageState from './useLocalStorageState'

const SECONDS = 1000

export default function useWallet() {
  const {
    connected,
    connection,
    current: wallet,
    providerUrl: selectedProviderUrl,
    set: setWalletStore,
    actions,
  } = useWalletStore((state) => state)
  console.debug(connection)

  const [timeInterval, setTimeInterval] = useState<number | null>(null)
  const [savedProviderUrl, setSavedProviderUrl] = useLocalStorageState(
    'walletProvider',
    DEFAULT_PROVIDER.url
  )
  const provider = useMemo(() => getWalletProviderByUrl(selectedProviderUrl), [
    selectedProviderUrl,
  ])

  useEffect(() => {
    if (selectedProviderUrl && selectedProviderUrl != savedProviderUrl) {
      setSavedProviderUrl(selectedProviderUrl)
    }
  }, [selectedProviderUrl])

  useEffect(() => {
    if (provider) {
      const updateWallet = () => {
        // hack to also update wallet synchronously in case it disconnects
        const wallet = provider.adapter
        setWalletStore((state) => {
          state.current = wallet
        })
      }

      if (document.readyState !== 'complete') {
        // wait to ensure that browser extensions are loaded
        const listener = () => {
          updateWallet()
          window.removeEventListener('load', listener)
        }
        window.addEventListener('load', listener)
        return () => window.removeEventListener('load', listener)
      } else {
        updateWallet()
      }
    }
  }, [provider, connection])

  useInterval(async () => {
    wallet?.connect()
    // when user is disconnected by window.solana.connect()
    // we should connect him again
    // but know with the right wallet
    try {
      await window.solana.connect()
      // the only purpose is to disconnect the user when he changes the wallet.
    } catch (error) {
      setTimeInterval(SECONDS)
      // So when the window.solana.connect() gives an error
      // we know that he changed the wallet
      // so we start the interval
      console.log(error)
    }
  }, timeInterval)

  useEffect(() => {
    if (!wallet) return
    wallet.on('connect', async () => {
      setWalletStore((state) => {
        state.connected = true
      })
      notify({
        message: 'Wallet connected',
        description:
          'Connected to wallet ' +
          wallet!.publicKey!.toString().substr(0, 5) +
          '...' +
          wallet!.publicKey!.toString().substr(-5),
      })
      await actions.fetchWalletTokenAccounts()
      await actions.fetchOwnVoteRecords()

      setTimeInterval(SECONDS)
      // start verifying if user changed account
    })
    wallet.on('disconnect', () => {
      setTimeInterval(null)
      // Stop verifying because user disconnected
      setWalletStore((state) => {
        state.connected = false
        state.tokenAccounts = []
      })
      notify({
        type: 'info',
        message: 'Disconnected from wallet',
      })
    })
    return () => {
      wallet?.disconnect?.()
      setWalletStore((state) => {
        state.connected = false
      })
    }
  }, [wallet])

  // fetch on page load
  useEffect(() => {
    const pageLoad = async () => {
      console.log('pageLoad')
    }
    pageLoad()
  }, [])

  // refresh regularly
  useInterval(async () => {
    console.log('refresh')
  }, 10 * SECONDS)

  return { connected, wallet }
}
