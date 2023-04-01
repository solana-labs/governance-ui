import { AnchorProvider, Program } from '@coral-xyz/anchor'
import useWalletOnePointOh from '@hooks/useWallet'
import { PsyFiEuros, PsyFiIdl } from 'psyfi-euros-test'
import { useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { MAINNET_PROGRAM_KEYS } from '../programIds'

export const usePsyFiProgram = () => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()

  // construct the PsyFi program. This could be pulled into a hook
  return useMemo(() => {
    const anchorProvider = new AnchorProvider(
      connection.current,
      wallet as any,
      {}
    )
    return new Program<PsyFiEuros>(
      PsyFiIdl,
      MAINNET_PROGRAM_KEYS.PSYFI_V2,
      anchorProvider
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [connection.current, wallet])
}
