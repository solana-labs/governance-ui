import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import queryClient from './queryClient'

const URL = 'https://price.jup.ag/v4/price'

/* example query
GET https://price.jup.ag/v4/price?ids=SOL
response: {"data":{"SOL":{"id":"So11111111111111111111111111111111111111112","mintSymbol":"SOL","vsToken":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","vsTokenSymbol":"USDC","price":26.649616441}},"timeTaken":0.0002587199999766199}
*/
/* example intentionally broken query 
GET https://price.jup.ag/v4/price?ids=bingus 
response: {"data":{},"timeTaken":0.00010941000005004753}
*/

type Price = {
  id: string // pubkey,
  mintSymbol: string
  vsToken: string // pubkey,
  vsTokenSymbol: string
  price: number
}
type Response = {
  data: Record<string, Price> //uses whatever you input (so, pubkey OR symbol). no entry if data not found
  timeTaken: number
}

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}

export const jupiterPriceQueryKeys = {
  all: ['Jupiter Price API'],
  byMint: (mint: PublicKey) => [...jupiterPriceQueryKeys.all, mint.toString()],
  byMints: (mints: PublicKey[]) => [
    ...jupiterPriceQueryKeys.all,
    mints.map((x) => x.toString()).sort(),
  ],
}

const jupQueryFn = async (mint: PublicKey) => {
  const x = await fetch(`${URL}?ids=${mint?.toString()}`)
  const response = (await x.json()) as Response
  const result = response.data[mint.toString()]
  return result !== undefined
    ? ({ found: true, result } as const)
    : ({ found: false, result: undefined } as const)
}

export const useJupiterPriceByMintQuery = (mint: PublicKey | undefined) => {
  const enabled = mint !== undefined
  return useQuery({
    queryKey: enabled ? jupiterPriceQueryKeys.byMint(mint) : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()
      return jupQueryFn(mint)
    },
  })
}

export const fetchJupiterPrice = async (mint: PublicKey) =>
  queryClient.fetchQuery({
    queryKey: jupiterPriceQueryKeys.byMint(mint),
    queryFn: () => jupQueryFn(mint),
  })

/**
 * @deprecated
 * do not use this! it only exists to replace a previously existing synchronous function. use fetchJupiterPrice
 * */
export const getJupiterPriceSync = (mint: PublicKey) =>
  ((queryClient.getQueryData(jupiterPriceQueryKeys.byMint(mint)) as any)?.result
    ?.price as number) ?? 0

export const useJupiterPricesByMintsQuery = (mints: PublicKey[]) => {
  const enabled = mints.length > 0
  return useQuery({
    enabled,
    queryKey: jupiterPriceQueryKeys.byMints(mints),
    queryFn: async () => {
      const batches = [...chunks(mints, 100)]
      const responses = await Promise.all(
        batches.map(async (batch) => {
          const x = await fetch(`${URL}?ids=${batch.join(',')}`)
          const response = (await x.json()) as Response
          return response
        })
      )
      const data = responses.reduce(
        (acc, next) => ({ ...acc, ...next.data }),
        {} as Response['data']
      )
      Object.keys(data).forEach((mint) =>
        queryClient.setQueryData(
          jupiterPriceQueryKeys.byMint(new PublicKey(mint)),
          data[mint]
            ? ({ found: true, result: data[mint] } as const)
            : ({ found: false, result: undefined } as const)
        )
      )
      return data
    },
  })
}
