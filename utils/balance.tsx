import BN from 'bn.js'
import { MintAccount, TokenAccount } from './tokens'

function fixedPointToNumber(value: BN, decimals: number) {
  const divisor = new BN(10).pow(new BN(decimals))
  const quotient = value.div(divisor)
  const remainder = value.mod(divisor)
  return quotient.toNumber() + remainder.toNumber() / divisor.toNumber()
}

export function calculateBalance(
  mints: { [pk: string]: MintAccount },
  account: TokenAccount
): number {
  const mint = mints[account.mint.toBase58()]
  return mint ? fixedPointToNumber(account.amount, mint.decimals) : 0
}
