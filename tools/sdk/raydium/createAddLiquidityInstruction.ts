import { Liquidity } from '@raydium-io/raydium-sdk'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { UXP_USDC_POOL_KEYS } from './poolKeys'

export const createAddLiquidityInstruction = (
  baseTokenAccount: PublicKey, //TokenA  we want to deposit (USDC or UXP)
  quoteTokenAccount: PublicKey, //Value in TokenB of TokenA  (UXP or USDC)
  lpTokenAccount: PublicKey,
  baseAmountIn: number,
  quoteAmountIn: number,
  owner: PublicKey
): TransactionInstruction => {
  const itx = Liquidity.makeAddLiquidityInstruction({
    poolKeys: UXP_USDC_POOL_KEYS,
    userKeys: {
      baseTokenAccount,
      quoteTokenAccount,
      lpTokenAccount,
      owner,
    },
    baseAmountIn: 1_000_000,
    quoteAmountIn: 1_000_000,
    fixedSide: 'quote',
  })

  return itx
}
