import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useMemo } from 'react'

import useWalletStore from '../stores/useWalletStore'
import { notify } from '../utils/notifications'
import {
  DEFAULT_PROVIDER,
  getWalletProviderByName,
} from '../utils/wallet-adapters'

import useInterval from './useInterval'
import useLocalStorageState from './useLocalStorageState'

const SECONDS = 1000

export default function useInitWallet() {
  const { wallets } = useWallet()
  const {
    connection,
    current: wallet,
    providerName: selectedProviderName,
    set: setWalletStore,
    actions,
  } = useWalletStore((state) => state)

  const [savedProviderName, setSavedProviderName] = useLocalStorageState(
    'walletProviderV2',
    DEFAULT_PROVIDER.name
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
    if (!selectedProviderName) {
      setWalletStore((s) => {
        s.providerName = savedProviderName
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [selectedProviderName, savedProviderName])

  const provider = useMemo(
    () => getWalletProviderByName(selectedProviderName, wallets),
    [savedProviderName, wallets]
  )

  // save selection in local storage
  useEffect(() => {
    if (selectedProviderName && selectedProviderName != savedProviderName) {
      setSavedProviderName(selectedProviderName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [selectedProviderName])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
}
