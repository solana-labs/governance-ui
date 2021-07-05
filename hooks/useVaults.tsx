import { useMemo } from 'react'
import useWalletStore from '../stores/useWalletStore'
import { calculateBalance } from '../utils/balance'

export default function useVaults() {
  const mints = useWalletStore((s) => s.mints)
  const usdcVault = useWalletStore((s) => s.usdcVault)
  const mangoVault = useWalletStore((s) => s.mangoVault)

  const usdc = useMemo(
    () =>
      usdcVault
        ? { account: usdcVault, balance: calculateBalance(mints, usdcVault) }
        : undefined,
    [usdcVault, mints]
  )
  const mango = useMemo(
    () =>
      mangoVault
        ? { account: mangoVault, balance: calculateBalance(mints, mangoVault) }
        : undefined,
    [mangoVault, mints]
  )

  return { usdc, mango }
}
