import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { useMemo } from 'react'

import useWalletStore from '../stores/useWalletStore'
import useWalletOnePointOh from './useWalletOnePointOh'
import { useConnection } from '@solana/wallet-adapter-react'
import useLegacyConnectionContext from './useLegacyConnectionContext'

/** @deprecated */
export default function useWalletDeprecated() {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const anchorProvider = useMemo(() => {
    const options = AnchorProvider.defaultOptions()
    return new AnchorProvider(
      connection.current,
      (wallet as unknown) as Wallet,
      options
    )
  }, [connection, wallet])

  return useMemo(() => ({ connected, wallet, anchorProvider, connection }), [
    anchorProvider,
    connected,
    connection,
    wallet,
  ])
}
