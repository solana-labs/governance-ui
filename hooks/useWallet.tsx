import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { useMemo } from 'react'

import useWalletStore from '../stores/useWalletStore'

export default function useWallet() {
  const { connected, connection, current: wallet } = useWalletStore(
    (state) => state
  )

  const anchorProvider = useMemo(() => {
    const options = AnchorProvider.defaultOptions()
    return new AnchorProvider(
      connection.current,
      (wallet as unknown) as Wallet,
      options
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [wallet])

  return { connected, wallet, anchorProvider, connection }
}
