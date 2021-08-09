import { PublicKey } from '@solana/web3.js'
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

export function calculateSupply(
  mints: { [pk: string]: MintAccount },
  pk: PublicKey
): number | undefined {
  const mint = mints[pk.toBase58()]
  return mint && fixedPointToNumber(mint.supply, mint.decimals)
}

export function calculateNativeAmountUnsafe(
  mints: { [pk: string]: MintAccount },
  pk: PublicKey,
  amount: number
): BN {
  const mint = mints[pk.toBase58()]
  const nativeAmount = Math.round(amount * Math.pow(10, mint.decimals))
  return new BN(nativeAmount.toString())
}
