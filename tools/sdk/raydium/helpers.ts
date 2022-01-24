import { BN } from '@project-serum/anchor'
import {
  Liquidity,
  LiquidityPoolKeys,
  Percent,
  TokenAmount,
  Token,
} from '@raydium-io/raydium-sdk'
import { PublicKey, Connection } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import { getGovernanceToken } from '../uxdProtocol/uxdClient'
import { Token as SPLToken } from '@solana/spl-token'

export const getAmountOut = async (
  poolKeys: LiquidityPoolKeys,
  tokenNameIn: string,
  amountIn: number,
  tokenNameOut: string,
  connection: ConnectionContext
) => {
  const tokenInData = getGovernanceToken(connection.cluster, tokenNameIn)
  const tokenOutData = getGovernanceToken(connection.cluster, tokenNameOut)
  const amountInBN = new BN(
    (
      Number(amountIn.toFixed(tokenInData.decimals)) *
      10 ** tokenInData.decimals
    ).toString()
  )
  const amountOut = Liquidity.computeCurrencyAmountOut({
    poolKeys,
    poolInfo: await Liquidity.fetchInfo({
      connection: connection.current,
      poolKeys,
    }),
    currencyAmountIn: new TokenAmount(
      new Token(new PublicKey(tokenInData.address), tokenInData.decimals),
      amountInBN
    ),
    currencyOut: new Token(
      new PublicKey(tokenOutData.address),
      tokenOutData.decimals
    ),
    slippage: new Percent(5, 1000),
  })
  const currentPrice = amountOut.currentPrice.toFixed(tokenOutData.decimals)

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
