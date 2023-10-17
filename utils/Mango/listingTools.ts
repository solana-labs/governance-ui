import {
  OPENBOOK_PROGRAM_ID,
  RouteInfo,
  toNative,
  toNativeI80F48,
} from '@blockworks-foundation/mango-v4'
import {
  LISTING_PRESETS,
  LISTING_PRESETS_KEYS,
  LISTING_PRESETS_PYTH,
  ListingPreset,
  getTierWithAdjustedNetBorrows,
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
import { fmtTokenAmount } from '@utils/formatting'
import Big from 'big.js'

const MAINNET_PYTH_PROGRAM = new PublicKey(
  'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH'
)

export type FlatListingArgs = {
  name: string
  tokenIndex: number
  'oracleConfig.confFilter': number
  'oracleConfig.maxStalenessSlots': number
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
  minVaultToDepositsRatio: number
  netBorrowLimitPerWindowQuote: number
  netBorrowLimitWindowSizeTs: number
  insuranceFound: boolean
  borrowWeightScaleStartQuote: number
  depositWeightScaleStartQuote: number
  stablePriceDelayGrowthLimit: number
  stablePriceDelayIntervalSeconds: number
  stablePriceGrowthLimit: number
  tokenConditionalSwapMakerFeeRate: number
  tokenConditionalSwapTakerFeeRate: number
  flashLoanDepositFeeRate: number
  reduceOnly: number
  groupInsuranceFund: boolean
  oracle: PublicKey
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
  flashLoanDepositFeeRateOpt: number
  reduceOnlyOpt: number
  groupInsuranceFundOpt: boolean
  oracleOpt: PublicKey
}

export type ListingArgsFormatted = {
  tokenIndex: number
  tokenName: string
  oracleConfidenceFilter: string
  oracleMaxStalenessSlots: number
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
  flashLoanDepositFeeRate: number
  reduceOnly: string
  oracle: string
}

export type EditTokenArgsFormatted = ListingArgsFormatted & {
  groupInsuranceFund: boolean
}

const transformPresetToProposed = (listingPreset: ListingPreset) => {
  const proposedPreset: FormattedListingPreset = {
    ...listingPreset,
    'oracleConfig.maxStalenessSlots': listingPreset.maxStalenessSlots!,
    'oracleConfig.confFilter': listingPreset.oracleConfFilter,
    'interestRateParams.adjustmentFactor': listingPreset.adjustmentFactor,
    'interestRateParams.util0': listingPreset.util0,
    'interestRateParams.rate0': listingPreset.rate0,
    'interestRateParams.util1': listingPreset.util1,
    'interestRateParams.rate1': listingPreset.rate1,
    'interestRateParams.maxRate': listingPreset.maxRate,
    groupInsuranceFund: listingPreset.insuranceFound,
  }

  return proposedPreset
}

type FormattedListingPreset = Omit<
  FlatListingArgs,
  'name' | 'tokenIndex' | 'oracle'
>

type ProposedListingPresets = {
  [key in LISTING_PRESETS_KEYS]: FormattedListingPreset
}

export const getFormattedListingPresets = (
  isPythOracle: boolean,
  currentTotalDepositsInUsdc?: number
) => {
  const PRESETS = isPythOracle ? LISTING_PRESETS_PYTH : LISTING_PRESETS

  const PROPOSED_LISTING_PRESETS: ProposedListingPresets = Object.keys(
    PRESETS
  ).reduce((accumulator, key) => {
    accumulator[key] = transformPresetToProposed(
      !currentTotalDepositsInUsdc
        ? PRESETS[key]
        : getTierWithAdjustedNetBorrows(
            PRESETS[key],
            currentTotalDepositsInUsdc
          )
    )
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
    const paramsString = new URLSearchParams({
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      amount: amount.toString(),
      slippageBps: Math.ceil(slippage * 100).toString(),
      feeBps: feeBps.toString(),
      swapMode,
    }).toString()

    const response = await fetch(
      `https://quote-api.jup.ag/v4/quote?${paramsString}`
    )

    const res = await response.json()
    const data = res.data

    return {
      routes: res.data as RouteInfo[],
      bestRoute: (data.length ? data[0] : null) as RouteInfo | null,
    }
  }
}

export const getSuggestedCoinTier = async (
  outputMint: string,
  hasPythOracle: boolean
) => {
  const TIERS: LISTING_PRESETS_KEYS[] = [
    'ULTRA_PREMIUM',
    'PREMIUM',
    'MID',
    'MEME',
    'SHIT',
  ]

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
          (x) => x.amount === val.amount && x.swapMode === 'ExactOut'
        )
        acc.push({
          amount: val.amount.toString(),
          priceImpactPct: exactOutRoute?.priceImpactPct
            ? (val.priceImpactPct + exactOutRoute.priceImpactPct) / 2
            : val.priceImpactPct,
        })
      }
      return acc
    },
    []
  )

  const indexForTierFromSwaps = averageSwaps.findIndex(
    (x) => x?.priceImpactPct && x?.priceImpactPct * 100 < 1
  )

  const tier =
    indexForTierFromSwaps > -1 ? TIERS[indexForTierFromSwaps] : 'UNTRUSTED'

  const tierLowerThenCurrent =
    tier === 'ULTRA_PREMIUM' || tier === 'PREMIUM'
      ? 'MID'
      : tier === 'MID'
      ? 'MEME'
      : tier
  const isPythRecommendedTier =
    tier === 'MID' || tier === 'PREMIUM' || tier === 'ULTRA_PREMIUM'
  const listingTier =
    isPythRecommendedTier && !hasPythOracle ? tierLowerThenCurrent : tier

  return {
    tier: listingTier,
    priceImpact: (indexForTierFromSwaps > -1
      ? averageSwaps[indexForTierFromSwaps]!.priceImpactPct
      : 100
    ).toFixed(2),
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

const isSwitchboardOracle = async (connection: Connection) => {
  const feedPk = new PublicKey('Ag7RdWj5t3U9avU4XKAY7rBbGDCNz456ckNmcpW1aHoE')
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
  const ai = await connection.getAccountInfo(feedPk)
  const elo = await decodePriceFromOracleAi(
    feedPk,
    ai!,
    connection,
    'switchboard'
  )
  console.log(elo)
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
    return `https://pyth.network/price-feeds/${feed.asset_type.toLowerCase()}-${feed.base.toLowerCase()}-${feed.quote_currency.toLowerCase()}?cluster=mainnet-beta`
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
    if (markets.length === 1) {
      return markets[0].publicKey
    }
    const marketsDataJsons = await Promise.all([
      ...markets.map((x) =>
        fetch(`/openSerumApi/market/${x.publicKey.toBase58()}`)
      ),
    ])
    const marketsData = await Promise.all([
      ...marketsDataJsons.map((x) => x.json()),
    ])
    const bestMarket = marketsData.sort((a, b) => b.volume24h - a.volume24h)
    return bestMarket.length
      ? new PublicKey(bestMarket[0].id)
      : markets[0].publicKey
  } catch (e) {
    return null
  }
}

export const decodePriceFromOracleAi = async (
  oracle: PublicKey,
  ai: AccountInfo<Buffer>,
  connection: Connection,
  type: string
): Promise<{
  uiPrice: number
  lastUpdatedSlot: number
  deviation: number
}> => {
  let uiPrice, lastUpdatedSlot, deviation
  if (type === 'pyth') {
    const priceData = parsePriceData(ai.data)
    uiPrice = priceData.previousPrice
    lastUpdatedSlot = parseInt(priceData.lastSlot.toString())
    deviation =
      priceData.previousConfidence !== undefined
        ? priceData.previousConfidence
        : undefined
  } else if (type === 'switchboard') {
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
  } else {
    throw new Error(
      `Unknown oracle provider (parsing not implemented) for oracle ${oracle}, with owner ${ai.owner}!`
    )
  }
  return { uiPrice, lastUpdatedSlot, deviation }
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
