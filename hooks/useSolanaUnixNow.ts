import { useEffect, useState } from 'react'
import { SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import useWalletDeprecated from './useWalletDeprecated'

export const useSolanaUnixNow = () => {
  const { anchorProvider } = useWalletDeprecated()
  const [unixNow, setUnixNow] = useState<number | undefined>()

  useEffect(() => {
    ;(async () => {
      const clock = await anchorProvider.connection.getAccountInfo(
        SYSVAR_CLOCK_PUBKEY
      )
      setUnixNow(Number(clock!.data.readBigInt64LE(8 * 4)))
    })()
  }, [setUnixNow, anchorProvider])

  return { unixNow }
}
