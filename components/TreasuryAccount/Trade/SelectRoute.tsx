import Select from '@components/inputs/Select'
import { Route } from '@utils/jupiter'
import React, { useState } from 'react'

const RouteCard: React.FC<{ route: Route }> = ({ route }) => {
  const platforms = route.marketInfos.map((market) => market.label).join(' + ')
  const mints = route.marketInfos.map((market) => market.inputMint.slice(0, 6))
  mints.push(
    route.marketInfos[route.marketInfos.length - 1].outputMint.slice(0, 6)
  )
  return (
    <div>
      <div>{platforms}</div>
      <div>{mints.join(' -> ')}</div>
    </div>
  )
}

const SelectRoute: React.FC<{ routes: Route[] }> = ({ routes }) => {
  const [route, setRoute] = useState<Route>()
  const platforms = route
    ? route.marketInfos.map((market) => market.label).join(' + ')
    : 'please select'
  return (
    <Select
      noMaxWidth={true}
      className="w-full"
      label="Select Route"
      value={platforms}
      onChange={(value) => {
        setRoute(value)
        console.log('selected', value)
      }}
    >
      {routes.map((route, index) => (
        <Select.Option key={index} value={route}>
          <RouteCard route={route} />
        </Select.Option>
      ))}
    </Select>
  )
}

export default SelectRoute
