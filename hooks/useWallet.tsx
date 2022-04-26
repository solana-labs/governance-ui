import { useEffect, useMemo } from 'react'

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

  const [savedProviderUrl, setSavedProviderUrl] = useLocalStorageState(
    'walletProvider',
    DEFAULT_PROVIDER.url
  )

  async function flipWalletByTurningOffAndOn() {
    if (wallet) {
      try {
        await wallet.disconnect()
        await wallet.connect()
      } catch (error) {
        const err = error as Error
        return notify({
          type: 'error',
          message: err.message,
        })
      }
    }
  }

  // initialize selection from local storage
  useEffect(() => {
    if (!selectedProviderUrl) {
      setWalletStore((s) => {
        s.providerUrl = savedProviderUrl
      })
    }
  }, [selectedProviderUrl, savedProviderUrl])

  const provider = useMemo(
    () => getWalletProviderByUrl(selectedProviderUrl),
    [selectedProviderUrl]
  )

  // save selection in local storage
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
      await actions.fetchDelegateVoteRecords()
    })
    wallet.on('disconnect', () => {
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
    // @ts-ignore
    const currentAddress = window?.solana?._publicKey?.toBase58()
    const staleAddress = wallet?.publicKey?.toString()
    if (staleAddress && currentAddress && staleAddress !== currentAddress) {
      console.log(
        `Wallet address changed from ${staleAddress} to ${currentAddress}`
      )
      flipWalletByTurningOffAndOn()
    }
  }, 3 * SECONDS)

  return { connected, wallet }
}
