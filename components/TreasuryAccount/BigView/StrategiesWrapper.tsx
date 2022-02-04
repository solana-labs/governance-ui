import Input from '@components/inputs/Input'
import { useState, useEffect } from 'react'
import useStrategiesStore from 'stores/useStrategiesStore'
import SelectFilter from './SelectFilter'
import StrategyItem from './StrategyItem'
import { MANGO, tokenListFilter } from './strategies/mango/tools'
import { NameVal, TreasuryStrategy } from './types/types'

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
  }, [])

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
  }, [filters, strategies])
  return (
    <div className="grid grid-cols-12 mt-10">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
        <div className="mb-10 flex flex-items">
          <h1>Strategies</h1>
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
          if (x.isGenericItem) {
            return (
              <StrategyItem
                key={x.handledMint}
                liquidity={x.liquidity}
                protocolSymbol={x.protocolSymbol}
                apy={x.apy}
                protocolName={x.protocolName}
                handledMint={x.handledMint}
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
