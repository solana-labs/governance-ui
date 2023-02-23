import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Wallet } from '@models/treasury/Wallet'
import { WSOL_MINT } from '@components/instructions/tools'
import useStrategiesStore from 'Strategies/store/useStrategiesStore'
import { AssetType, Sol, Token } from '@models/treasury/Asset'
import { Result, Status, Ok } from '@utils/uiTypes/Result'
import useWalletStore from 'stores/useWalletStore'
import { EVERLEND } from 'Strategies/protocols/everlend/tools'
import { SOLEND } from 'Strategies/protocols/solend'
import { TreasuryStrategy } from 'Strategies/types/types'
import loadData from './loadData'
import * as staticInvestments from './staticInvestments'

const cache: Map<string, Ok<Data>> = new Map()

type Asset =
  | Pick<Sol, 'address' | 'count' | 'type'>
  | Pick<Token, 'address' | 'count' | 'logo' | 'type' | 'mintAddress'>

interface Args {
  asset: Asset
  wallet?: Wallet
  governanceAddress?: string
}

export interface ActiveInvestment extends TreasuryStrategy {
  investedAmount: number
}

interface Data {
  activeInvestments: ActiveInvestment[]
  potentialInvestments: TreasuryStrategy[]
}

export function useAccountInvestments(args: Args) {
  const [result, setResult] = useState<Result<Data>>({
    _tag: Status.Pending,
  })
  const [calledGetStrategies, setCalledGetStrategies] = useState(false)

  const connection = useWalletStore((s) => s.connection)
  const strategies = useStrategiesStore((s) => s.strategies)
  const getStrategies = useStrategiesStore((s) => s.getStrategies)
  const strategiesLoading = useStrategiesStore((s) => s.strategiesLoading)

  const tokenAddress = args.asset.address
  const tokenAmount = args.asset.count
  const governanceAddress = args.governanceAddress

  const owner =
    args.asset.type === AssetType.Sol
      ? new PublicKey(tokenAddress)
      : // @ts-ignore
        args.asset?.raw?.extensions?.token?.account?.owner

  const strategyMintAddress =
    args.asset.type === AssetType.Sol ? WSOL_MINT : args.asset.mintAddress

  const visibleInvestments = strategies.filter(
    (strat) => strat.handledMint === strategyMintAddress
  )

  useEffect(() => {
    getStrategies(connection)
    setCalledGetStrategies(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  useEffect(() => {
    const cacheKey = args.asset.address + args.asset.type + governanceAddress
    const cachedValue = cache.get(cacheKey)

    if (cachedValue) {
      setResult(cachedValue)
      return
    }

    if (strategyMintAddress && calledGetStrategies && !strategiesLoading) {
      setResult({ _tag: Status.Pending })

      loadData({
        strategies,
        strategyMintAddress,
        tokenAddress,
        tokenAmount,
        wallet: args.wallet,
        connection: connection.current,
        loadEverlend: !!visibleInvestments.filter(
          (x) => x.protocolName === EVERLEND
        ).length,
        loadSolend: !!visibleInvestments.filter(
          (x) => x.protocolName === SOLEND
        ).length,
        owner,
      })
        .then((activeInvestments) => {
          const result = {
            _tag: Status.Ok,
            data: {
              activeInvestments: activeInvestments.filter(
                (i) => !!i.investedAmount
              ),
              potentialInvestments: strategies
                .filter((strat) => strat.handledMint === strategyMintAddress)
                .concat([
                  ...(args.asset.type === AssetType.Sol
                    ? staticInvestments.getSolInvestments()
                    : []),
                  ...(args.asset.type === AssetType.Token
                    ? staticInvestments.getTokenInvestments(
                        args.asset.logo || ''
                      )
                    : []),
                ]),
            },
          } as Ok<Data>

          cache.set(cacheKey, result)
          setResult(result)
        })
        .catch((e) =>
          setResult({
            _tag: Status.Failed,
            error: e instanceof Error ? e : new Error(e),
          })
        )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    args.asset.address,
    args.asset.type,
    governanceAddress,
    calledGetStrategies,
    strategiesLoading,
  ])

  return result
}
