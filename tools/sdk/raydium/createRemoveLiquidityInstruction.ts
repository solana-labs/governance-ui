import { BN } from '@project-serum/anchor'
import { Liquidity } from '@raydium-io/raydium-sdk'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import { UXP_USDC_POOL_KEYS } from './poolKeys'

// FIXME: missing parameter to select to correct pool
// only working now because we have just one pool (UXP/USDC)
export const createRemoveLiquidityInstruction = (
  owner: PublicKey,
  amountIn: string // amount of LP token to redeem?
): TransactionInstruction => {
  const [lpTokenAccount] = findATAAddrSync(owner, UXP_USDC_POOL_KEYS.lpMint)
  const [baseTokenAccount] = findATAAddrSync(owner, UXP_USDC_POOL_KEYS.baseMint)
  const [quoteTokenAccount] = findATAAddrSync(
    owner,
    UXP_USDC_POOL_KEYS.quoteMint
  )

  const itx = Liquidity.makeRemoveLiquidityInstruction({
    poolKeys: UXP_USDC_POOL_KEYS,
    userKeys: {
      baseTokenAccount,
      quoteTokenAccount,
      lpTokenAccount,
      owner,
    },
    amountIn: new BN(amountIn),
  })

  return itx
}
