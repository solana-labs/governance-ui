import { BN } from '@project-serum/anchor'
import {
  AmountSide,
  Liquidity,
  LiquidityPoolKeys,
} from '@raydium-io/raydium-sdk'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'

export const createAddLiquidityInstruction = (
  poolKeys: LiquidityPoolKeys,
  baseAmountIn: BN,
  quoteAmountIn: BN,
  fixedSide: AmountSide,
  owner: PublicKey
): TransactionInstruction => {
  const [lpTokenAccount] = findATAAddrSync(owner, poolKeys.lpMint)
  const [baseTokenAccount] = findATAAddrSync(owner, poolKeys.baseMint)
  const [quoteTokenAccount] = findATAAddrSync(owner, poolKeys.quoteMint)

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
