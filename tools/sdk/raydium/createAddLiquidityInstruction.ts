import { BN } from '@project-serum/anchor'
import { AmountSide, Liquidity } from '@raydium-io/raydium-sdk'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import { getLiquidityPoolKeysByAssets } from './helpers'

export const createAddLiquidityInstruction = (
  tokenMintA: PublicKey, //TokenA  we want to deposit (USDC or UXP)
  tokenMintB: PublicKey, //Value in TokenB of TokenA  (UXP or USDC)
  amountA: BN,
  amountB: BN,
  fixedSide: AmountSide,
  owner: PublicKey
): TransactionInstruction => {
  const poolKeys = getLiquidityPoolKeysByAssets(tokenMintA, tokenMintB)

  if (!poolKeys) {
    throw new Error('pool not found')
  }
  const [lpTokenAccount] = findATAAddrSync(owner, poolKeys.lpMint)
  const [baseTokenAccount] = findATAAddrSync(owner, poolKeys.baseMint)
  const [quoteTokenAccount] = findATAAddrSync(owner, poolKeys.quoteMint)

  let baseAmountIn = amountA
  let quoteAmountIn = amountB
  if (tokenMintA.equals(poolKeys.quoteMint)) {
    baseAmountIn = amountB
    quoteAmountIn = amountA
  }

  const itx = Liquidity.makeAddLiquidityInstruction({
    poolKeys,
    userKeys: {
      baseTokenAccount,
      quoteTokenAccount,
      lpTokenAccount,
      owner,
    },
    baseAmountIn,
    quoteAmountIn,
    fixedSide,
  })

  return itx
}
