import {
  RouteInfo,
  toNative,
  toUiDecimals,
} from '@blockworks-foundation/mango-v4'
import { MAINNET_USDC_MINT } from '@foresight-tmp/foresight-sdk/dist/consts'
import { secondsToHours } from 'date-fns'

export type ListingArgs = {
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
  borrowWeightScale: number
  depositWeightScale: number
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
}

export const getFormattedListingValues = (args: ListingArgs) => {
  console.log(args)
  const formattedArgs: ListingArgsFormatted = {
    tokenIndex: args.tokenIndex,
    tokenName: args.name,
    oracleConfidenceFilter: (args['oracleConfig.confFilter'] * 100).toFixed(2),
    oracleMaxStalenessSlots: args['oracleConfig.maxStalenessSlots'],
    interestRateUtilizationPoint0: (
      args['interestRateParams.util0'] * 100
    ).toFixed(2),
    interestRatePoint0: (args['interestRateParams.rate0'] * 100).toFixed(2),
    interestRateUtilizationPoint1: (
      args['interestRateParams.util1'] * 100
    ).toFixed(2),
    interestRatePoint1: (args['interestRateParams.rate1'] * 100).toFixed(2),
    maxRate: (args['interestRateParams.maxRate'] * 100).toFixed(2),
    adjustmentFactor: (
      args['interestRateParams.adjustmentFactor'] * 100
    ).toFixed(2),
    loanFeeRate: (args.loanFeeRate * 10000).toFixed(2),
    loanOriginationFeeRate: (args.loanOriginationFeeRate * 10000).toFixed(2),
    maintAssetWeight: args.maintAssetWeight.toFixed(2),
    initAssetWeight: args.initAssetWeight.toFixed(2),
    maintLiabWeight: args.maintLiabWeight.toFixed(2),
    initLiabWeight: args.initLiabWeight.toFixed(2),
    liquidationFee: (args['liquidationFee'] * 100).toFixed(2),
    minVaultToDepositsRatio: (args['minVaultToDepositsRatio'] * 100).toFixed(2),
    netBorrowLimitPerWindowQuote: toUiDecimals(
      args['netBorrowLimitPerWindowQuote'],
      6
    ),
    netBorrowLimitWindowSizeTs: secondsToHours(args.netBorrowLimitWindowSizeTs),
  }
  return formattedArgs
}

const listingBase: Omit<ListingArgs, 'name' | 'tokenIndex'> = {
  'oracleConfig.maxStalenessSlots': 120,
  'oracleConfig.confFilter': 0.1,
  'interestRateParams.adjustmentFactor': 0.004,
  'interestRateParams.util0': 0.5,
  'interestRateParams.rate0': 0.052,
  'interestRateParams.util1': 0.8,
  'interestRateParams.rate1': 0.1446,
  'interestRateParams.maxRate': 1.4456,
  loanFeeRate: 0.005,
  loanOriginationFeeRate: 0.001,
  maintAssetWeight: 0.9,
  initAssetWeight: 0.8,
  maintLiabWeight: 1.1,
  initLiabWeight: 1.2,
  liquidationFee: 0.05,
  minVaultToDepositsRatio: 0.2,
  netBorrowLimitWindowSizeTs: 24 * 60 * 60,
  netBorrowLimitPerWindowQuote: toNative(50000, 6).toNumber(),
  insuranceFound: true,
  borrowWeightScale: toNative(250000, 6).toNumber(),
  depositWeightScale: toNative(250000, 6).toNumber(),
}

export type LISTING_PRESETS_KEYS =
  | 'PREMIUM'
  | 'MID'
  | 'MEME'
  | 'SHIT'
  | 'UNTRUSTED'

export const LISTING_PRESETS: {
  [key in LISTING_PRESETS_KEYS]:
    | (typeof listingBase & { presetName: string })
    | Record<string, never>
} = {
  //Price impact $100,000 < 1%
  PREMIUM: {
    ...listingBase,
    presetName: 'Premium',
  },
  //Price impact $20,000 < 1%
  MID: {
    ...listingBase,
    maintAssetWeight: 0.75,
    initAssetWeight: 0.5,
    maintLiabWeight: 1.2,
    initLiabWeight: 1.4,
    liquidationFee: 0.1,
    netBorrowLimitPerWindowQuote: toNative(20000, 6).toNumber(),
    presetName: 'Mid',
    borrowWeightScale: toNative(50000, 6).toNumber(),
    depositWeightScale: toNative(50000, 6).toNumber(),
    insuranceFound: false,
  },
  //Price impact $5,000 < 1%
  MEME: {
    ...listingBase,
    'oracleConfig.maxStalenessSlots': 800,
    loanOriginationFeeRate: 0.002,
    maintAssetWeight: 0,
    initAssetWeight: 0,
    maintLiabWeight: 1.25,
    initLiabWeight: 1.5,
    liquidationFee: 0.125,
    netBorrowLimitPerWindowQuote: toNative(5000, 6).toNumber(),
    borrowWeightScale: toNative(20000, 6).toNumber(),
    depositWeightScale: toNative(20000, 6).toNumber(),
    insuranceFound: false,
    presetName: 'Meme',
  },
  //Price impact $1,000 < 1%
  SHIT: {
    ...listingBase,
    'oracleConfig.maxStalenessSlots': 800,
    loanOriginationFeeRate: 0.002,
    maintAssetWeight: 0,
    initAssetWeight: 0,
    maintLiabWeight: 1.4,
    initLiabWeight: 1.8,
    liquidationFee: 0.2,
    netBorrowLimitPerWindowQuote: toNative(1000, 6).toNumber(),
    borrowWeightScale: toNative(5000, 6).toNumber(),
    depositWeightScale: toNative(5000, 6).toNumber(),
    insuranceFound: false,
    presetName: 'Shit',
  },
  UNTRUSTED: {},
}

export const coinTiersToNames: {
  [key in LISTING_PRESETS_KEYS]: string
} = {
  PREMIUM: 'Blue Chip',
  MID: 'Mid-wit',
  MEME: 'Meme',
  SHIT: 'Shit Coin',
  UNTRUSTED: 'Untrusted',
}

export const fetchJupiterRoutes = async (
  inputMint = 'So11111111111111111111111111111111111111112',
  outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount = 0,
  slippage = 50,
  swapMode = 'ExactIn',
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

export const getSuggestedCoinTier = async (outputMint: string) => {
  const TIERS: LISTING_PRESETS_KEYS[] = ['PREMIUM', 'MID', 'MEME', 'SHIT']
  const swaps = await Promise.all([
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
  ])
  const indexForTierFromSwaps = swaps.findIndex(
    (x) => x.bestRoute?.priceImpactPct && x.bestRoute?.priceImpactPct * 100 < 1
  )
  const tier =
    indexForTierFromSwaps > -1 ? TIERS[indexForTierFromSwaps] : 'UNTRUSTED'
  return {
    tier,
    priceImpact: (
      (indexForTierFromSwaps > -1
        ? swaps[indexForTierFromSwaps].bestRoute!.priceImpactPct
        : swaps[swaps.length - 1].bestRoute!.priceImpactPct) * 100
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
