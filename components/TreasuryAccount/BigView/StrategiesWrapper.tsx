import Input from '@components/inputs/Input'
import { useState, useEffect } from 'react'
import SelectFilter from './SelectFilter'
import MangoItem from './strategies/mango/MangoItem'
import { MANGO, mangoTokensList, tvl } from './strategies/mango/tools'
import { NameVal, TreasuryStrategy } from './types/types'

const StrategiesWrapper = () => {
  const tokens: NameVal[] = [
    { name: 'All tokens', val: null },
    ...mangoTokensList,
  ]
  const platforms: NameVal[] = [
    { name: 'All platforms', val: null },
    { name: MANGO, val: MANGO },
  ]
  const [strategies, setStrategies] = useState<TreasuryStrategy[]>([])
  const [strategiesFiltered, setStrategiesFilterd] = useState<
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
    async function getStrategies() {
      const mango = await tvl(Date.now() / 1000)
      setStrategies([...mango])
    }
    getStrategies()
  }, [])

  useEffect(() => {
    let filtered = [...strategies]
    const { token, platform, search } = filters
    if (token.val) {
      filtered = filtered.filter((x) => x.symbol.includes(token.val!))
    }
    if (platform.val) {
      filtered = filtered.filter((x) => x.protocol === platform.val)
    }
    //search by any thing
    if (search) {
      filtered = filtered.filter(
        (x) =>
          Object.values(x).filter((j) =>
            `${j}`.toLowerCase().includes(search.toLowerCase())
          ).length
      )
    }
    setStrategiesFilterd([...filtered])
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
          if (x.protocol === MANGO) {
            return (
              <MangoItem
                symbol={x.symbol}
                liquidity={x.liquidity}
                apy={x.apy}
                key={x.symbol}
                tokenImgSrc={x.tokenImgSrc}
                strategy={x.strategy}
                mint={x.mint}
                protocol={x.protocol}
              ></MangoItem>
            )
          }
        })}
      </div>
    </div>
  )
}
export default StrategiesWrapper
