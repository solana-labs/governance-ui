import { BN } from '@project-serum/anchor'
import {
  getMultipleAccountsInfo,
  Liquidity,
  LiquidityAssociatedPoolKeys,
  LiquidityPoolKeys,
  LiquidityPoolKeysV4,
  LiquidityStateLayout,
  LiquidityStateV4,
  LIQUIDITY_VERSION_TO_STATE_LAYOUT,
  Logger,
  Market,
  Percent,
  Token,
  TokenAmount,
} from '@raydium-io/raydium-sdk'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import { uiToNative } from '@blockworks-foundation/mango-client'
import group from '@utils/group'

export const getMinimumAmountOut = async ({
  poolKeys,
  amountIn,
  connection,
  slippage,
}: {
  poolKeys: LiquidityPoolKeysV4
  amountIn: number
  connection: Connection
  slippage: number
}) => {
  if (amountIn <= 0) return 0

  const { baseMint, quoteMint } = poolKeys

  const [base, quote] = await Promise.all([
    connection.getTokenSupply(baseMint),
    connection.getTokenSupply(quoteMint),
  ])

  const { minAmountOut } = Liquidity.computeAmountOut({
    poolKeys,

    poolInfo: await Liquidity.fetchInfo({
      connection: connection,
      poolKeys,
    }),

    amountIn: new TokenAmount(
      new Token(baseMint, base.value.decimals),
      uiToNative(amountIn, base.value.decimals)
    ),

    currencyOut: new Token(quoteMint, quote.value.decimals),

    // slippage in 1/1000
    slippage: new Percent(new BN(slippage), 10),
  })

  const currentPrice = minAmountOut.toFixed(quote.value.decimals)

  return Number(currentPrice) * amountIn
}

function parsePoolAccountInfo(
  logger: Logger,
  {
    pubkey,
    account: accountInfo,
    version,
    programId,
    serumVersion,
    serumProgramId,
    stateLayout: LIQUIDITY_STATE_LAYOUT,
  }
) {
  logger.assertArgument(
    !!accountInfo,
    'empty state account info',
    'pool.id',
    pubkey
  )

  const { data } = accountInfo

  logger.assertArgument(
    data.length === LIQUIDITY_STATE_LAYOUT.span,
    'invalid state data length',
    'pool.id',
    pubkey
  )

  const fields = LIQUIDITY_STATE_LAYOUT.decode(data)

  const {
    status,
    baseMint,
    quoteMint,
    baseDecimal,
    quoteDecimal,
    lpMint,
    openOrders,
    targetOrders,
    baseVault,
    quoteVault,
    marketId,
  } = fields

  let withdrawQueue: PublicKey
  let lpVault: PublicKey

  if (Liquidity.isV4(fields)) {
    withdrawQueue = (fields as LiquidityStateV4).withdrawQueue
    lpVault = (fields as LiquidityStateV4).lpVault
  } else {
    withdrawQueue = PublicKey.default
    lpVault = PublicKey.default
  }

  // uninitialized
  if (status.isZero()) {
    return null
  }

  const {
    baseDecimals,
    quoteDecimals,
    lpDecimals,
    authority,
    marketAuthority,
  } = Liquidity.getAssociatedPoolKeys({
    version,
    marketVersion: serumVersion,
    marketId,
    baseMint,
    baseDecimals: baseDecimal.toNumber(),
    quoteMint,
    quoteDecimals: quoteDecimal.toNumber(),
    programId,
    marketProgramId: serumProgramId,
  })

  return {
    id: pubkey,
    baseMint,
    quoteMint,
    baseDecimals,
    quoteDecimals,
    lpDecimals,
    lpMint,
    version,
    programId,
    authority,
    openOrders,
    targetOrders,
    baseVault,
    quoteVault,
    withdrawQueue,
    lpVault,
    marketVersion: serumVersion,
    marketProgramId: serumProgramId,
    marketId,
    marketAuthority,
  }
}

// Rewrite SDK fetchAllPoolKeys and adapt it to be able to load only pools matching provided mint
export async function fetchPoolKeysForMint(
  connection: Connection,
  mint: PublicKey
): Promise<LiquidityPoolKeys[]> {
  const logger = Logger.from('Liquidity')

  // supported versions
  const supported = Object.keys(LIQUIDITY_VERSION_TO_STATE_LAYOUT).map((v) => {
    const version = Number(v)
    const serumVersion = Liquidity.getSerumVersion(version)
    const serumProgramId = Market.getProgramId(serumVersion)
    return {
      version,
      programId: Liquidity.getProgramId(version),
      serumVersion,
      serumProgramId,
      stateLayout: Liquidity.getStateLayout(version),
    }
  })

  let poolsAccountInfo: {
    pubkey: PublicKey
    account: AccountInfo<Buffer>

    version: number
    programId: PublicKey
    serumVersion: number
    serumProgramId: PublicKey
    stateLayout: LiquidityStateLayout
  }[][] = []

  try {
    poolsAccountInfo = await Promise.all(
      supported.reduce(
        (
          requests,
          { programId, version, serumVersion, serumProgramId, stateLayout }
        ) => {
          requests.push(
            connection
              .getProgramAccounts(programId, {
                filters: [
                  { dataSize: stateLayout.span },
                  {
                    memcmp: {
                      // Look for pool having USDC as baseMint
                      offset: 400,
                      bytes: mint.toBase58(),
                    },
                  },
                ],
              })
              .then((accounts) =>
                accounts.map((info) => ({
                  ...info,
                  ...{
                    version,
                    programId,
                    serumVersion,
                    serumProgramId,
                    stateLayout,
                  },
                }))
              )
          )

          requests.push(
            connection
              .getProgramAccounts(programId, {
                filters: [
                  { dataSize: stateLayout.span },
                  {
                    memcmp: {
                      // Look for pool having USDC as quoteMint
                      offset: 432,
                      bytes: mint.toBase58(),
                    },
                  },
                ],
              })
              .then((accounts) =>
                accounts.map((info) => ({
                  ...info,
                  ...{
                    version,
                    programId,
                    serumVersion,
                    serumProgramId,
                    stateLayout,
                  },
                }))
              )
          )

          return requests
        },
        [] as Promise<any>[]
      )
    )
  } catch (error) {
    if (error instanceof Error) {
      return logger.throwError(
        'failed to fetch all liquidity pools',
        Logger.errors.RPC_ERROR,
        {
          message: error.message,
        }
      )
    }
  }

  const flatPoolsAccountInfo = poolsAccountInfo.flat()

  const tempPoolsKeys: Omit<
    LiquidityAssociatedPoolKeys,
    'nonce'
  >[] = flatPoolsAccountInfo
    .map((poolAccountInfo) => parsePoolAccountInfo(logger, poolAccountInfo))
    .filter((info) => info !== null) as Omit<
    LiquidityAssociatedPoolKeys,
    'nonce'
  >[]

  // fetch market keys
  let marketsInfo: (AccountInfo<Buffer> | null)[] = []

  // Load multiple accounts in batch to avoid error:
  // 413 : request body size exceeds allowed maximum
  const tempPoolsKeysGroups = group(tempPoolsKeys, 50)

  try {
    marketsInfo = (
      await Promise.all(
        tempPoolsKeysGroups.map((tempPoolsKeysGroup) =>
          getMultipleAccountsInfo(
            connection,
            tempPoolsKeysGroup.map(({ marketId }) => marketId),
            {
              batchRequest: true,
            }
          )
        )
      )
    ).flat()
  } catch (error) {
    if (error instanceof Error) {
      return logger.throwError(
        'failed to fetch markets',
        Logger.errors.RPC_ERROR,
        {
          message: error.message,
        }
      )
    }
  }

  logger.assertArgument(
    marketsInfo.length === tempPoolsKeys.length,
    'markets count not equal to pools',
    'markets.length',
    marketsInfo.length
  )

  return marketsInfo.reduce((poolsKeys, marketInfo, index) => {
    const poolKeys = tempPoolsKeys[index]

    const { id, marketVersion } = poolKeys

    if (!marketInfo) {
      console.log('empty market account info')
      return poolsKeys
    }

    const { data } = marketInfo
    const { state: MARKET_STATE_LAYOUT } = Market.getLayouts(marketVersion)
    logger.assertArgument(
      data.length === MARKET_STATE_LAYOUT.span,
      'invalid market data length',
      'pool.id',
      id
    )

    const {
      baseVault: marketBaseVault,
      quoteVault: marketQuoteVault,
      bids: marketBids,
      asks: marketAsks,
      eventQueue: marketEventQueue,
    } = MARKET_STATE_LAYOUT.decode(data)

    return [
      ...poolsKeys,
      {
        ...poolKeys,
        ...{
          marketBaseVault,
          marketQuoteVault,
          marketBids,
          marketAsks,
          marketEventQueue,
        },
      },
    ]
  }, [] as LiquidityPoolKeys[])
}
