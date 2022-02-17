import Input from '@components/inputs/Input'
import Loading from '@components/Loading'
import tokenService from '@utils/services/token'
import { useState, useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { MANGO, tokenListFilter } from 'Strategies/protocols/mango/tools'
import useStrategiesStore from 'Strategies/store/useStrategiesStore'
import { NameVal, TreasuryStrategy } from 'Strategies/types/types'
import MangoItem from './MangoItem'
import SelectFilter from './SelectFilter'
import StrategyItem from './StrategyItem'

const StrategiesWrapper = () => {
  const searchAbleProps = [
    'liquidity',
    'apy',
    'protocolSymbol',
    'protocolName',
    'handledTokenSymbol',
    'strategyName',
  ]
  const tokens: NameVal[] = [
    { name: 'All tokens', val: null },
    ...tokenListFilter,
  ]
  const platforms: NameVal[] = [
    { name: 'All platforms', val: null },
    { name: MANGO, val: MANGO },
  ]
  const { getStrategies } = useStrategiesStore()
  const strategies = useStrategiesStore((s) => s.strategies)
  const connection = useWalletStore((s) => s.connection)
  const strategiesLoading = useStrategiesStore((s) => s.strategiesLoading)
  const [strategiesFiltered, setStrategiesFiltered] = useState<
    TreasuryStrategy[]
  >([])
  const [filters, setFilters] = useState({
    token: tokens[0],
    platform: platforms[0],
    search: '',
  })
  const handleSetFilter = (val, name) => {
    setFilters({ ...filters, [name]: val })
  }
  useEffect(() => {
    getStrategies()
  }, [tokenService._tokenList])

  useEffect(() => {
    let filtered = [...strategies]
    const { token, platform, search } = filters
    if (token.val) {
      filtered = filtered.filter((x) => x.protocolSymbol.includes(token.val!))
    }
    if (platform.val) {
      filtered = filtered.filter((x) => x.protocolName === platform.val)
    }
    //search by any thing
    if (search) {
      filtered = filtered.filter(
        (x) =>
          Object.values(
            Object.keys(x).filter((key) => searchAbleProps.includes(key))
          ).filter((j) => `${j}`.toLowerCase().includes(search.toLowerCase()))
            .length
      )
    }
    setStrategiesFiltered([...filtered])
  }, [filters, JSON.stringify(strategies)])
  return (
    <div
      className={`grid grid-cols-12 mt-10 ${
        strategiesLoading ? 'pointer-event-none' : ''
      }`}
    >
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
        <div className="mb-10 flex flex-items">
          <h1 className="flex items-center">
            Strategies{' '}
            {strategiesLoading && <Loading className="ml-3"></Loading>}
          </h1>
          <div className="ml-auto flex space-x-3">
            <Input
              wrapperClassName="mt-1"
              value={filters.search}
              placeholder="Filter"
              type="text"
              onChange={(e) => {
                handleSetFilter(e.target.value, 'search')
              }}
            ></Input>
            <SelectFilter
              onChange={(selected) => handleSetFilter(selected, 'platform')}
              placeholder="Select platform"
              value={filters.platform.name}
              options={platforms}
            ></SelectFilter>
            <SelectFilter
              onChange={(selected) => handleSetFilter(selected, 'token')}
              placeholder="Select token"
              value={filters.token.name}
              options={tokens}
            ></SelectFilter>
          </div>
        </div>
        <div className="grid grid-cols-6 px-4">
          <div>Platform</div>
          <div>Strategy</div>
          <div>Your position</div>
          <div>Token</div>
          <div>Liquidity</div>
          <div>Yield</div>
        </div>
        {strategiesFiltered.map((x) => {
          if (x.protocolName === 'Mango') {
            return (
              <MangoItem
                key={x.protocolName + x.handledTokenSymbol}
                liquidity={x.liquidity}
                protocolSymbol={x.protocolSymbol}
                apy={x.apy}
                protocolName={x.protocolName}
                handledMint={
                  connection.cluster === 'devnet'
                    ? '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'
                    : x.handledMint
                }
                handledTokenSymbol={x.handledTokenSymbol}
                handledTokenImgSrc={x.handledTokenImgSrc}
                protocolLogoSrc={x.protocolLogoSrc}
                strategyName={x.strategyName}
                currentPosition={x.currentPosition}
                strategyDescription={x.strategyDescription}
                createProposalFcn={x.createProposalFcn}
              ></MangoItem>
            )
          }
          if (x.isGenericItem) {
            return (
              <StrategyItem
                key={x.protocolName + x.handledTokenSymbol}
                liquidity={x.liquidity}
                protocolSymbol={x.protocolSymbol}
                apy={x.apy}
                protocolName={x.protocolName}
                handledMint={
                  connection.cluster === 'devnet'
                    ? '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'
                    : x.handledMint
                }
                handledTokenSymbol={x.handledTokenSymbol}
                handledTokenImgSrc={x.handledTokenImgSrc}
                protocolLogoSrc={x.protocolLogoSrc}
                strategyName={x.strategyName}
                currentPosition={x.currentPosition}
                strategyDescription={x.strategyDescription}
                createProposalFcn={x.createProposalFcn}
              ></StrategyItem>
            )
          }
          //Add custom item based on protocol if needed
        })}
      </div>
    </div>
  )
}
export default StrategiesWrapper
