// import useWalletStore from '../stores/useWalletStore'
import { calculateBalance } from '../utils/balance'
import { TokenProgramAccount, TokenAccount } from '../utils/tokens'

export function findLargestBalanceAccountForMint(
  mints,
  tokenAccounts: TokenProgramAccount<TokenAccount>[],
  mintPk
) {
  const accounts = tokenAccounts.filter((a) => a.account.mint.equals(mintPk))
  if (!accounts.length) return undefined

  const balances = accounts.map((a) => calculateBalance(mints, a.account))
  const maxBalanceAccountIndex = balances.reduce(
    (iMax, bal, iBal) => (bal > balances[iMax] ? iBal : iMax),
    0
  )
  const account = accounts[maxBalanceAccountIndex]
  const balance = balances[maxBalanceAccountIndex]

  return { account, balance }
}

/*
export default function useLargestAccounts() {
  const { pool, tokenAccounts, mints, usdcVault } = useWalletStore(
    (state) => state
  )
  const usdc = usdcVault
    ? findLargestBalanceAccountForMint(mints, tokenAccounts, usdcVault.mint)
    : undefined
  const redeemable = pool
    ? findLargestBalanceAccountForMint(
        mints,
        tokenAccounts,
        pool.redeemableMint
      )
    : undefined
  return { usdc, redeemable }
}
*/
