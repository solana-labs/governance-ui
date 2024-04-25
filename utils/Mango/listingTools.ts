import {
  Bank,
  Group,
  I80F48,
  OPENBOOK_PROGRAM_ID,
  RouteInfo,
  toNative,
  toUiDecimals,
  toUiDecimalsForQuote,
} from '@blockworks-foundation/mango-v4'
import {
  LISTING_PRESET,
  LISTING_PRESETS,
  LISTING_PRESETS_KEY,
  getPresetWithAdjustedNetBorrows,
  getPresetWithAdjustedDepositLimit,
} from '@blockworks-foundation/mango-v4-settings/lib/helpers/listingTools'
import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import { MAINNET_USDC_MINT } from '@foresight-tmp/foresight-sdk/dist/consts'
import { Market } from '@project-serum/serum'
import { PythHttpClient, parsePriceData } from '@pythnetwork/client'
import {
  AccountInfo,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import SwitchboardProgram from '@switchboard-xyz/sbv2-lite'
import { notify } from '@utils/notifications'
import Big from 'big.js'
import { secondsToHours } from 'date-fns'

export const REDUCE_ONLY_OPTIONS = [
  { value: 0, name: 'Disabled' },
  { value: 1, name: 'No borrows and no deposits' },
  { value: 2, name: 'No borrows' },
]

const MAINNET_PYTH_PROGRAM = new PublicKey(
  'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH'
)

export type FlatListingArgs = {
  name: string
  tokenIndex: number
  'oracleConfig.confFilter': number
  'oracleConfig.maxStalenessSlots': number | null
  'interestRateParams.util0': number
  'interestRateParams.rate0': number
  'interestRateParams.util1': number
  'interestRateParams.rate1': number
  'interestRateParams.maxRate': number
  'interestRateParams.adjustmentFactor': number
  loanFeeRate: number
  loanOriginationFeeRate: number
  maintAssetWeight: number
  initAssetWeight: number
  maintLiabWeight: number
  initLiabWeight: number
  liquidationFee: number
  platformLiquidationFee: number
  minVaultToDepositsRatio: number
  netBorrowLimitPerWindowQuote: number
  netBorrowLimitWindowSizeTs: number
  borrowWeightScaleStartQuote: number
  depositWeightScaleStartQuote: number
  stablePriceDelayGrowthLimit: number
  stablePriceDelayIntervalSeconds: number
  stablePriceGrowthLimit: number
  tokenConditionalSwapMakerFeeRate: number
  tokenConditionalSwapTakerFeeRate: number
  flashLoanSwapFeeRate: number
  reduceOnly: number
  groupInsuranceFund: boolean
  oracle: PublicKey
  depositLimit: number
  interestTargetUtilization: number
  interestCurveScaling: number
  setFallbackOracle: boolean
  maintWeightShiftAbort: boolean
  zeroUtilRate: number
  disableAssetLiquidation: boolean
  collateralFeePerDay: number
}

export type FlatEditArgs = {
  nameOpt: string
  tokenIndex: number
  'oracleConfigOpt.confFilter': number
  'oracleConfigOpt.maxStalenessSlots': number
  'interestRateParamsOpt.util0': number
  'interestRateParamsOpt.rate0': number
  'interestRateParamsOpt.util1': number
  'interestRateParamsOpt.rate1': number
  'interestRateParamsOpt.maxRate': number
  'interestRateParamsOpt.adjustmentFactor': number
  loanFeeRateOpt: number
  loanOriginationFeeRateOpt: number
  maintAssetWeightOpt: number
  initAssetWeightOpt: number
  maintLiabWeightOpt: number
  initLiabWeightOpt: number
  liquidationFeeOpt: number
  platformLiquidationFeeOpt: number
  minVaultToDepositsRatioOpt: number
  netBorrowLimitPerWindowQuoteOpt: number
  netBorrowLimitWindowSizeTsOpt: number
  borrowWeightScaleStartQuoteOpt: number
  depositWeightScaleStartQuoteOpt: number
  stablePriceDelayGrowthLimitOpt: number
  stablePriceDelayIntervalSecondsOpt: number
  stablePriceGrowthLimitOpt: number
  tokenConditionalSwapMakerFeeRateOpt: number
  tokenConditionalSwapTakerFeeRateOpt: number
  flashLoanSwapFeeRateOpt: number
  reduceOnlyOpt: number
  groupInsuranceFundOpt: boolean
  oracleOpt: PublicKey
  interestCurveScalingOpt: number
  interestTargetUtilizationOpt: number
  maintWeightShiftStartOpt: BN
  maintWeightShiftEndOpt: BN
  maintWeightShiftAssetTargetOpt: number
  maintWeightShiftLiabTargetOpt: number
  maintWeightShiftAbort: boolean
  setFallbackOracle: boolean
  depositLimitOpt: number
  zeroUtilRateOpt: number
  disableAssetLiquidationOpt: boolean
  collateralFeePerDayOpt: number
  forceWithdrawOpt: boolean
  forceCloseOpt: boolean
}

export type ListingArgsFormatted = {
  tokenIndex: number
  tokenName: string
  oracleConfidenceFilter: string
  oracleMaxStalenessSlots: number | null
  interestRateUtilizationPoint1: string
  interestRateUtilizationPoint0: string
  interestRatePoint0: string
  interestRatePoint1: string
  adjustmentFactor: string
  maxRate: string
  loanFeeRate: string
  loanOriginationFeeRate: string
  maintAssetWeight: string
  initAssetWeight: string
  maintLiabWeight: string
  initLiabWeight: string
  liquidationFee: string
  platformLiquidationFee: string
  minVaultToDepositsRatio: string
  netBorrowLimitPerWindowQuote: number
  netBorrowLimitWindowSizeTs: number
  borrowWeightScaleStartQuote: number
  depositWeightScaleStartQuote: number
  stablePriceDelayGrowthLimit: string
  stablePriceDelayIntervalSeconds: number
  stablePriceGrowthLimit: string
  tokenConditionalSwapMakerFeeRate: number
  tokenConditionalSwapTakerFeeRate: number
  flashLoanSwapFeeRate: string
  reduceOnly: string
  oracle: string
  depositLimit: string
  interestTargetUtilization: number
  interestCurveScaling: number
  groupInsuranceFund: boolean
  zeroUtilRate: string
  disableAssetLiquidation: boolean
  collateralFeePerDay: string
}

export type EditTokenArgsFormatted = ListingArgsFormatted & {
  maintWeightShiftStart: number
  maintWeightShiftEnd: number
  maintWeightShiftAssetTarget: number
  maintWeightShiftLiabTarget: number
  maintWeightShiftAbort: boolean
  setFallbackOracle: boolean
  forceWithdraw: boolean
  forceClose: boolean
}

const transformPresetToProposed = (listingPreset: LISTING_PRESET) => {
  const proposedPreset: FormattedListingPreset = {
    ...listingPreset,
    'oracleConfig.maxStalenessSlots':
      listingPreset.maxStalenessSlots === -1
        ? null
        : listingPreset.maxStalenessSlots!,
    'oracleConfig.confFilter': listingPreset.oracleConfFilter,
    'interestRateParams.adjustmentFactor': listingPreset.adjustmentFactor,
    'interestRateParams.util0': listingPreset.util0,
    'interestRateParams.rate0': listingPreset.rate0,
    'interestRateParams.util1': listingPreset.util1,
    'interestRateParams.rate1': listingPreset.rate1,
    'interestRateParams.maxRate': listingPreset.maxRate,
    groupInsuranceFund: listingPreset.groupInsuranceFund,
    maintWeightShiftAbort: false,
    setFallbackOracle: false,
  }

  return proposedPreset
}

type FormattedListingPreset = Omit<
  FlatListingArgs,
  'name' | 'tokenIndex' | 'oracle'
>

type ProposedListingPresets = {
  [key in LISTING_PRESETS_KEY]: FormattedListingPreset
}

export const getFormattedListingPresets = (
  uiDeposits?: number,
  decimals?: number,
  tokenPrice?: number
) => {
  const PRESETS = LISTING_PRESETS

  const PROPOSED_LISTING_PRESETS: ProposedListingPresets = Object.keys(
    PRESETS
  ).reduce((accumulator, key) => {
    let adjustedPreset = PRESETS[key]
    if (uiDeposits && tokenPrice) {
      adjustedPreset = getPresetWithAdjustedNetBorrows(
        PRESETS[key],
        uiDeposits,
        tokenPrice,
        toUiDecimals(PRESETS[key].netBorrowLimitPerWindowQuote, 6)
      )
    }

    if (decimals && tokenPrice) {
      adjustedPreset = getPresetWithAdjustedDepositLimit(
        adjustedPreset,
        tokenPrice,
        decimals
      )
    }
    accumulator[key] = transformPresetToProposed(adjustedPreset)
    return accumulator
  }, {} as ProposedListingPresets)
  return PROPOSED_LISTING_PRESETS
}

const fetchJupiterRoutes = async (
  inputMint = 'So11111111111111111111111111111111111111112',
  outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount = 0,
  swapMode = 'ExactIn',
  slippage = 50,
  feeBps = 0
) => {
  {
    try {
      const paramsString = new URLSearchParams({
        inputMint: inputMint.toString(),
        outputMint: outputMint.toString(),
        amount: amount.toString(),
        slippageBps: Math.ceil(slippage * 100).toString(),
        feeBps: feeBps.toString(),
        swapMode,
      }).toString()

      const jupiterSwapBaseUrl =
        process.env.NEXT_PUBLIC_JUPTER_SWAP_API_ENDPOINT ||
        'https://public.jupiterapi.com'
      const response = await fetch(
        `${jupiterSwapBaseUrl}/quote?${paramsString}`
      )

      const res = await response.json()
      return {
        bestRoute: (res ? res : null) as RouteInfo | null,
      }
    } catch (e) {
      console.log(e)
      return {
        bestRoute: null,
      }
    }
  }
}

export const getSuggestedCoinPresetInfo = async (outputMint: string) => {
  try {
    const PRESETS = LISTING_PRESETS

    const swaps = await Promise.all([
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(250000, 6).toNumber()
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(100000, 6).toNumber()
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(20000, 6).toNumber()
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(10000, 6).toNumber()
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(5000, 6).toNumber()
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(1000, 6).toNumber()
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(250000, 6).toNumber(),
        'ExactOut'
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(100000, 6).toNumber(),
        'ExactOut'
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(20000, 6).toNumber(),
        'ExactOut'
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(20000, 6).toNumber(),
        'ExactOut'
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(5000, 6).toNumber(),
        'ExactOut'
      ),
      fetchJupiterRoutes(
        MAINNET_USDC_MINT.toBase58(),
        outputMint,
        toNative(1000, 6).toNumber(),
        'ExactOut'
      ),
    ])
    const bestRoutesSwaps = swaps
      .filter((x) => x.bestRoute)
      .map((x) => x.bestRoute!)

    const averageSwaps = bestRoutesSwaps.reduce(
      (acc: { amount: string; priceImpactPct: number }[], val) => {
        if (val.swapMode === 'ExactIn') {
          const exactOutRoute = bestRoutesSwaps.find(
            (x) => x.outAmount === val.inAmount && x.swapMode === 'ExactOut'
          )

          acc.push({
            amount: val.inAmount.toString(),
            priceImpactPct: exactOutRoute?.priceImpactPct
              ? (Number(val.priceImpactPct) +
                  Number(exactOutRoute.priceImpactPct)) /
                2
              : Number(val.priceImpactPct),
          })
        }
        return acc
      },
      []
    )

    const indexForTargetAmount = averageSwaps.findIndex(
      (x) => x?.priceImpactPct && x?.priceImpactPct * 100 < 1
    )

    const targetAmount =
      indexForTargetAmount > -1
        ? toUiDecimals(new BN(averageSwaps[indexForTargetAmount].amount), 6)
        : 0

    const preset: LISTING_PRESET =
      Object.values(PRESETS).find(
        (x) => x.preset_target_amount === targetAmount
      ) || PRESETS.UNTRUSTED

    return {
      presetKey: preset.preset_key,
      priceImpact: (indexForTargetAmount > -1
        ? averageSwaps[indexForTargetAmount]!.priceImpactPct
        : 100
      ).toFixed(2),
    }
  } catch (e) {
    console.log(e)
    return {
      presetKey: 'UNTRUSTED',
      priceImpact: '100',
    }
  }
}

export const compareObjectsAndGetDifferentKeys = <T extends object>(
  object1: T,
  object2: T
): (keyof T)[] => {
  const diffKeys: string[] = []

  Object.keys(object1).forEach((key) => {
    if (object1[key] !== object2[key]) {
      diffKeys.push(key)
    }
  })

  return diffKeys as (keyof T)[]
}

const isSwitchboardOracle = async (
  connection: Connection,
  feedPk: PublicKey
) => {
  const SWITCHBOARD_PROGRAM_ID = 'SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f'

  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(
    connection,
    new EmptyWallet(Keypair.generate()),
    options
  )
  const idl = await Program.fetchIdl(
    new PublicKey(SWITCHBOARD_PROGRAM_ID),
    provider
  )
  const switchboardProgram = new Program(
    idl!,
    new PublicKey(SWITCHBOARD_PROGRAM_ID),
    provider
  )
  const feeds = await switchboardProgram.account.aggregatorAccountData.all()
  const feed = feeds.find((x) => x.publicKey.equals(feedPk))

  return feed
    ? `https://app.switchboard.xyz/solana/mainnet-beta/feed/${feedPk.toBase58()}`
    : ''
}

export const isPythOracle = async (
  connection: Connection,
  feedPk: PublicKey
) => {
  const pythClient = new PythHttpClient(connection, MAINNET_PYTH_PROGRAM)
  const pythAccounts = await pythClient.getData()
  const feed = pythAccounts.products.find(
    (x) => x.price_account === feedPk.toBase58()
  )

  if (feed) {
    return `https://pyth.network/price-feeds/${feed.asset_type.toLowerCase()}-${feed.base.toLowerCase()}-${feed.quote_currency.toLowerCase()}?cluster=solana-mainnet-beta`
  }
  return ''
}

export const getOracle = async (connection: Connection, feedPk: PublicKey) => {
  const switchboardUrl = await isSwitchboardOracle(connection, feedPk)
  if (switchboardUrl) {
    return {
      type: 'Switchboard',
      url: switchboardUrl,
    }
  }
  const pythUrl = await isPythOracle(connection, feedPk)
  if (pythUrl) {
    return {
      type: 'Pyth',
      url: pythUrl,
    }
  }
  return {
    type: 'Unknown',
    url: '',
  }
}

export default class EmptyWallet implements Wallet {
  constructor(readonly payer: Keypair) {}

  async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> {
    if (tx instanceof Transaction) {
      tx.partialSign(this.payer)
    }

    return tx
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]> {
    return txs.map((t) => {
      if (t instanceof Transaction) {
        t.partialSign(this.payer)
      }
      return t
    })
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey
  }
}

export const getBestMarket = async ({
  baseMint,
  quoteMint,
  cluster,
  connection,
}: {
  baseMint: string
  quoteMint: string
  cluster: 'devnet' | 'mainnet-beta'
  connection: Connection
}) => {
  try {
    const dexProgramPk = OPENBOOK_PROGRAM_ID[cluster]

    const markets = await Market.findAccountsByMints(
      connection,
      new PublicKey(baseMint),
      new PublicKey(quoteMint),
      dexProgramPk
    )

    if (!markets.length) {
      return undefined
    }
    const marketsDataJsons = await Promise.all([
      ...markets.map((x) =>
        fetch(`/openSerumApi/market/${x.publicKey.toBase58()}`)
      ),
    ])
    const marketsData = await Promise.all([
      ...marketsDataJsons.map((x) => x.json()),
    ])
    let error = ''
    let sortedMarkets = marketsData.sort((a, b) => b.volume24h - a.volume24h)
    let firstBestMarket = sortedMarkets[0]

    if (firstBestMarket.volume24h === 0) {
      error = 'Openbook market had 0 volume in last 24h check it carefully'
    }
    sortedMarkets = sortedMarkets.sort(
      (a, b) => b.quoteDepositsTotal - a.quoteDepositsTotal
    )
    firstBestMarket = sortedMarkets[0]

    return sortedMarkets.length
      ? { pubKey: new PublicKey(firstBestMarket.id), error: error }
      : undefined
  } catch (e) {
    notify({
      message: 'Openbook market not found',
      type: 'error',
    })
  }
}

export const decodePriceFromOracleAi = async (
  ai: AccountInfo<Buffer>,
  connection: Connection,
  type: string
): Promise<{
  uiPrice: number
  lastUpdatedSlot: number
  deviation: string
}> => {
  let uiPrice, lastUpdatedSlot, deviation
  try {
    if (type === 'Pyth') {
      const priceData = parsePriceData(ai.data)
      uiPrice = priceData.previousPrice
      lastUpdatedSlot = parseInt(priceData.lastSlot.toString())
      deviation =
        priceData.previousConfidence !== undefined
          ? ((priceData.previousConfidence / uiPrice) * 100).toFixed(2)
          : undefined
    } else if (type === 'Switchboard') {
      const program = await SwitchboardProgram.loadMainnet(connection)
      uiPrice = program.decodeLatestAggregatorValue(ai)!.toNumber()
      lastUpdatedSlot = program
        .decodeAggregator(ai)
        .latestConfirmedRound!.roundOpenSlot!.toNumber()
      deviation = (
        (switchboardDecimalToBig(
          program.decodeAggregator(ai).latestConfirmedRound.stdDeviation
        ).toNumber() /
          uiPrice) *
        100
      ).toFixed(2)
    }
    return { uiPrice, lastUpdatedSlot, deviation }
  } catch (e) {
    return { uiPrice, lastUpdatedSlot, deviation }
  }
}

export function switchboardDecimalToBig(sbDecimal: {
  mantissa: BN
  scale: number
}): Big {
  const mantissa = new Big(sbDecimal.mantissa.toString())
  const scale = sbDecimal.scale
  const oldDp = Big.DP
  Big.DP = 20
  const result: Big = mantissa.div(new Big(10).pow(scale))
  Big.DP = oldDp
  return result
}

export const getFormattedBankValues = (group: Group, bank: Bank) => {
  return {
    ...bank,
    publicKey: bank.publicKey.toBase58(),
    vault: bank.vault.toBase58(),
    oracle: bank.oracle.toBase58(),
    fallbackOracle: bank.fallbackOracle.toBase58(),
    stablePrice: group.toUiPrice(
      I80F48.fromNumber(bank.stablePriceModel.stablePrice),
      bank.mintDecimals
    ),
    maxStalenessSlots: bank.oracleConfig.maxStalenessSlots.toNumber(),
    lastStablePriceUpdated: new Date(
      1000 * bank.stablePriceModel.lastUpdateTimestamp.toNumber()
    ).toUTCString(),
    stablePriceGrowthLimitsDelay: (
      100 * bank.stablePriceModel.delayGrowthLimit
    ).toFixed(2),
    stablePriceGrowthLimitsStable: (
      100 * bank.stablePriceModel.stableGrowthLimit
    ).toFixed(2),
    loanFeeRate: (10000 * bank.loanFeeRate.toNumber()).toFixed(2),
    loanOriginationFeeRate: (
      10000 * bank.loanOriginationFeeRate.toNumber()
    ).toFixed(2),
    collectedFeesNative: toUiDecimals(
      bank.collectedFeesNative.toNumber(),
      bank.mintDecimals
    ).toFixed(2),
    collectedFeesNativePrice: (
      toUiDecimals(bank.collectedFeesNative.toNumber(), bank.mintDecimals) *
      bank.uiPrice
    ).toFixed(2),
    dust: bank.dust.toNumber(),
    deposits: toUiDecimals(
      bank.indexedDeposits.mul(bank.depositIndex).toNumber(),
      bank.mintDecimals
    ),
    depositsPrice: (
      toUiDecimals(
        bank.indexedDeposits.mul(bank.depositIndex).toNumber(),
        bank.mintDecimals
      ) * bank.uiPrice
    ).toFixed(2),
    borrows: toUiDecimals(
      bank.indexedBorrows.mul(bank.borrowIndex).toNumber(),
      bank.mintDecimals
    ),
    borrowsPrice: (
      toUiDecimals(
        bank.indexedBorrows.mul(bank.borrowIndex).toNumber(),
        bank.mintDecimals
      ) * bank.uiPrice
    ).toFixed(2),
    avgUtilization: bank.avgUtilization.toNumber() * 100,
    maintAssetWeight: bank.maintAssetWeight.toFixed(2),
    maintLiabWeight: bank.maintLiabWeight.toFixed(2),
    initAssetWeight: bank.initAssetWeight.toFixed(2),
    initLiabWeight: bank.initLiabWeight.toFixed(2),
    scaledInitAssetWeight: bank.scaledInitAssetWeight(bank.price).toFixed(2),
    scaledInitLiabWeight: bank.scaledInitLiabWeight(bank.price).toFixed(2),
    depositWeightScaleStartQuote: toUiDecimalsForQuote(
      bank.depositWeightScaleStartQuote
    ),
    borrowWeightScaleStartQuote: toUiDecimalsForQuote(
      bank.borrowWeightScaleStartQuote
    ),
    rate0: (100 * bank.rate0.toNumber()).toFixed(2),
    util0: (100 * bank.util0.toNumber()).toFixed(),
    rate1: (100 * bank.rate1.toNumber()).toFixed(2),
    util1: (100 * bank.util1.toNumber()).toFixed(),
    maxRate: (100 * bank.maxRate.toNumber()).toFixed(2),
    adjustmentFactor: (bank.adjustmentFactor.toNumber() * 100).toFixed(2),
    depositRate: bank.getDepositRateUi(),
    borrowRate: bank.getBorrowRateUi(),
    lastIndexUpdate: new Date(
      1000 * bank.indexLastUpdated.toNumber()
    ).toUTCString(),
    lastRatesUpdate: new Date(
      1000 * bank.bankRateLastUpdated.toNumber()
    ).toUTCString(),
    oracleConfFilter:
      bank.oracleConfig.confFilter.toNumber() === Number.MAX_SAFE_INTEGER
        ? ''
        : (100 * bank.oracleConfig.confFilter.toNumber()).toFixed(2),
    minVaultToDepositsRatio: bank.minVaultToDepositsRatio * 100,
    netBorrowsInWindow: toUiDecimalsForQuote(
      I80F48.fromI64(bank.netBorrowsInWindow).mul(bank.price)
    ).toFixed(2),
    netBorrowLimitPerWindowQuote: toUiDecimals(
      bank.netBorrowLimitPerWindowQuote,
      6
    ),
    liquidationFee: (bank.liquidationFee.toNumber() * 100).toFixed(2),
    platformLiquidationFee: (
      bank.platformLiquidationFee.toNumber() * 100
    ).toFixed(2),
    netBorrowLimitWindowSizeTs: secondsToHours(
      bank.netBorrowLimitWindowSizeTs.toNumber()
    ),
    depositLimit: bank.depositLimit.toString(),
    interestTargetUtilization: bank.interestTargetUtilization,
    interestCurveScaling: bank.interestCurveScaling,
    reduceOnly: REDUCE_ONLY_OPTIONS[bank.reduceOnly].name,
    maintWeightShiftStart: bank.maintWeightShiftStart.toNumber(),
    maintWeightShiftEnd: bank.maintWeightShiftEnd.toNumber(),
    maintWeightShiftAssetTarget: bank.maintWeightShiftAssetTarget.toNumber(),
    maintWeightShiftLiabTarget: bank.maintWeightShiftLiabTarget.toNumber(),
  }
}
