import { BN } from '@project-serum/anchor'
import { Liquidity } from '@raydium-io/raydium-sdk'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import { getLiquidityPoolKeysByLabel } from './helpers'

// FIXME: missing parameter to select to correct pool
// only working now because we have just one pool (UXP/USDC)
export const createRemoveLiquidityInstruction = (
  owner: PublicKey,
  liquidityPool: string,
  amountIn: string
): TransactionInstruction => {
  const poolKeys = getLiquidityPoolKeysByLabel(liquidityPool)
  const [lpTokenAccount] = findATAAddrSync(owner, poolKeys.lpMint)
  const [baseTokenAccount] = findATAAddrSync(owner, poolKeys.baseMint)
  const [quoteTokenAccount] = findATAAddrSync(owner, poolKeys.quoteMint)

  const itx = Liquidity.makeRemoveLiquidityInstruction({
    poolKeys,
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
