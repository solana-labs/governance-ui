import { BN } from '@project-serum/anchor'

type SwapMode = 'ExactIn' | 'ExactOut'

type MarketInfo = {
  id: string
  label: string
  inputMint: string
  outputMint: string
  notEnoughLiquidity: boolean
  inAmount: string
  outAmount: string
  priceImpactPct: number
  lpFee: {
    amount: string
    mint: string
    pct: number
  }
  platformFee: {
    amount: string
    mint: string
    pct: number
  }
}

export type Route = {
  inAmount: string
  outAmount: string
  priceImpactPct: number
  marketInfos: MarketInfo[]
  amount: string
  slippageBps: number
  otherAmountThreshold: string
  swapMode: SwapMode
}

type QuoteRes = {
  data: Route[]
  timeTaken: number
  contextSlot: number
}

export const queryRoutes = async (
  inputMint: string,
  outputMint: string,
  inputAmount: BN
): Promise<QuoteRes> => {
  const res = await fetch(
    `https://quote-api.jup.ag/v4/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmount.toString()}&onlyDirectRoutes=true`
  )
  if (res.status === 200) {
    const body = (await res.json()) as QuoteRes
    return body
  } else {
    throw new Error(res.statusText)
  }
}

export const filterRoutes = (routes: Route[], platforms: string[]): Route[] =>
  routes.filter((route) => {
    for (let i = 0; i < route.marketInfos.length; i++) {
      const market = route.marketInfos[i]
      if (!platforms.includes(market.label)) {
        return false
      }
    }
    return true
  })
