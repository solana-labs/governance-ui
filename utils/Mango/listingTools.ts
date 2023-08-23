import {
  OPENBOOK_PROGRAM_ID,
  RouteInfo,
  toNative,
} from '@blockworks-foundation/mango-v4'
import {
  LISTING_PRESETS,
  LISTING_PRESETS_KEYS,
  LISTING_PRESETS_PYTH,
  ListingPreset,
} from '@blockworks-foundation/mango-v4-settings/lib/helpers/listingTools'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { MAINNET_USDC_MINT } from '@foresight-tmp/foresight-sdk/dist/consts'
import { Market } from '@project-serum/serum'
import { PythHttpClient } from '@pythnetwork/client'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'

const MAINNET_PYTH_PROGRAM = new PublicKey(
  'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH'
)

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

export type EditTokenArgsFormatted = ListingArgsFormatted & {
  borrowWeightScaleStartQuote: number
  depositWeightScaleStartQuote: number
  groupInsuranceFund: boolean
}

const transformPresetToProposed = (
  listingPreset: ListingPreset | Record<string, never>
) => {
  const proposedPreset: PureListingArgsOrEmptyObj =
    Object.keys(listingPreset).length !== 0
      ? {
          ...(listingPreset as ListingPreset),
          'oracleConfig.maxStalenessSlots': listingPreset.maxStalenessSlots!,
          'oracleConfig.confFilter': listingPreset.oracleConfFilter,
          'interestRateParams.adjustmentFactor': listingPreset.adjustmentFactor,
          'interestRateParams.util0': listingPreset.util0,
          'interestRateParams.rate0': listingPreset.rate0,
          'interestRateParams.util1': listingPreset.util1,
          'interestRateParams.rate1': listingPreset.rate1,
          'interestRateParams.maxRate': listingPreset.maxRate,
        }
      : {}

  return proposedPreset
}

type PureListingArgsOrEmptyObj =
  | Record<string, never>
  | (Omit<ListingArgs, 'name' | 'tokenIndex'> & {
      preset_name: string
    })

type ProposedListingPresets = {
  [key in LISTING_PRESETS_KEYS]: PureListingArgsOrEmptyObj
}

export const getFormattedListingPresets = (isPythOracle: boolean) => {
  const PRESETS = isPythOracle ? LISTING_PRESETS_PYTH : LISTING_PRESETS
  const PROPOSED_LISTING_PRESETS: ProposedListingPresets = Object.keys(
    PRESETS
  ).reduce((accumulator, key) => {
    accumulator[key] = transformPresetToProposed(PRESETS[key])
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
    tier === 'PREMIUM' ? 'MID' : tier === 'MID' ? 'MEME' : tier
  const isMidOrPremium = tier === 'MID' || tier === 'PREMIUM'
  const listingTier =
    isMidOrPremium && !hasPythOracle ? tierLowerThenCurrent : tier

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
