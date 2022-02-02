import { BN } from '@project-serum/anchor'
import {
  Liquidity,
  LiquidityPoolKeys,
  Percent,
  TokenAmount,
  Token,
} from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import { liquidityPoolKeys, liquidityPoolList } from './poolKeys'

export const getAmountOut = async (
  liquidityPool: string,
  amountIn: number,
  connection: ConnectionContext
) => {
  const poolKeys = getLiquidityPoolKeysByLabel(liquidityPool)
  const base = await connection.current.getTokenSupply(poolKeys.baseMint)
  const quote = await connection.current.getTokenSupply(poolKeys.quoteMint)
  const amountInBN = new BN(
    (
      Number(amountIn.toFixed(base.value.decimals)) *
      10 ** base.value.decimals
    ).toString()
  )
  const amountOut = Liquidity.computeCurrencyAmountOut({
    poolKeys,
    poolInfo: await Liquidity.fetchInfo({
      connection: connection.current,
      poolKeys,
    }),
    currencyAmountIn: new TokenAmount(
      new Token(poolKeys.baseMint, base.value.decimals),
      amountInBN
    ),
    currencyOut: new Token(poolKeys.quoteMint, quote.value.decimals),
    slippage: new Percent(5, 1000),
  })
  const currentPrice = amountOut.currentPrice.toFixed(quote.value.decimals)

  return Number(currentPrice) * amountIn
}

export const getLPMintInfo = async (
  connection: ConnectionContext,
  lpMint: PublicKey,
  user: PublicKey
) => {
  const [lpTokenAccount] = findATAAddrSync(user, lpMint)
  const lpInfo = await connection.current.getTokenSupply(lpMint)
  const lpUserBalance = await connection.current.getTokenAccountBalance(
    lpTokenAccount
  )
  return {
    lpTokenAccount,
    maxBalance: lpUserBalance.value.uiAmount ?? 0,
    decimals: lpInfo.value.decimals,
  }
}

export const getLiquidityPoolKeysByAssets = (
  base: PublicKey,
  quote: PublicKey
): LiquidityPoolKeys | undefined => {
  return liquidityPoolKeys.find(
    (pk) =>
      (pk.baseMint.equals(base) && pk.quoteMint.equals(quote)) ||
      (pk.baseMint.equals(quote) && pk.quoteMint.equals(base))
  )
}

export const getLiquidityPoolKeysByLabel = (
  label: string
): LiquidityPoolKeys => {
  const lp = liquidityPoolList.find((lp) => lp.label === label)?.id
  if (!lp) throw new Error('pool not found for label ' + label)

  const poolKeys = liquidityPoolKeys.find((lpk) => lpk.id.equals(lp))
  if (!poolKeys) throw new Error('pool not found for id ' + lp.toBase58())

  return poolKeys
}
