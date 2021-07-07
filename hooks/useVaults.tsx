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

  const usdcBalance = useMemo(
    () => (usdc ? `${Math.round(usdc.balance).toLocaleString()}` : 'N/A'),
    [usdc]
  )
  const mangoBalance = useMemo(
    () => `${mango?.balance.toLocaleString()}` || 'N/A',
    [mango]
  )

  const estimatedPrice = useMemo(
    () => (usdc && mango ? `$${usdc.balance / mango.balance}` : 'N/A'),
    [usdc, mango]
  )

  return { usdc, mango, usdcBalance, mangoBalance, estimatedPrice }
}
