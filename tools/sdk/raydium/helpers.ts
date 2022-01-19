import {
  Liquidity,
  LiquidityPoolKeys,
  Percent,
  Token,
  TokenAmount,
} from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { getGovernanceToken } from '../uxdProtocol/uxdClient'

export const getAmountOut = async (
  poolKeys: LiquidityPoolKeys,
  tokenNameIn: string,
  amountIn: number,
  tokenNameOut: string,
  connection: ConnectionContext
) => {
  const tokenInData = getGovernanceToken(connection.cluster, tokenNameIn)
  const tokenOutData = getGovernanceToken(connection.cluster, tokenNameOut)

  const amountOut = Liquidity.computeCurrencyAmountOut({
    poolKeys,
    poolInfo: await Liquidity.fetchInfo({
      connection: connection.current,
      poolKeys,
    }),
    currencyAmountIn: new TokenAmount(
      new Token(new PublicKey(tokenInData.address), tokenInData.decimals),
      amountIn
    ),
    currencyOut: new Token(
      new PublicKey(tokenOutData.address),
      tokenOutData.decimals
    ),
    slippage: new Percent(1, 100),
  })

  return amountOut.amountOut
}
