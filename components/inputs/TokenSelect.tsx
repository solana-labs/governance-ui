import React, { useState } from 'react'
import Input from '@components/inputs/Input'
import { TokenInfo } from '@solana/spl-token-registry'
import tokenPriceService from '@utils/services/tokenPrice'
import Select from './Select'
import { StyledLabel } from './styles'

const TokenSelect: React.FC<{
  label: string
  onSelect: (tokenInfo: TokenInfo) => void
}> = ({ label, onSelect }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TokenInfo[]>([])
  const [selectedToken, setSelectedToken] = useState<TokenInfo>()
  const tokenList = tokenPriceService._tokenList

  if (selectedToken) {
    return (
      <TokenSelected
        label={label}
        tokenInfo={selectedToken}
        onClick={() => setSelectedToken(undefined)}
      />
    )
  }

  return (
    <>
      <Input
        noMaxWidth={true}
        label={label}
        type="text"
        value={query}
        onChange={(event) => {
          const _query = event.target.value
          setQuery(_query)
          const regex = new RegExp(`^${_query}`, 'i')
          const results = tokenList.filter((item) => !!item.symbol.match(regex))
          setResults(results)
        }}
      />
      {results.length > 0 && (
        <Select
          noMaxWidth={true}
          value={''}
          onChange={(value) => {
            setSelectedToken(value)
            onSelect(value)
          }}
        >
          {results.map((tokenInfo) => (
            <Select.Option
              key={tokenInfo.address}
              value={tokenInfo}
            >{`${tokenInfo.symbol}\n${tokenInfo.address}`}</Select.Option>
          ))}
        </Select>
      )}
    </>
  )
}

const TokenSelected: React.FC<{
  label?: string
  tokenInfo: TokenInfo
  onClick: () => void
}> = ({ tokenInfo, onClick, label }) => {
  return (
    <div className={`flex flex-col relative`} onClick={onClick}>
      {label && <StyledLabel>{label}</StyledLabel>}
      {`${tokenInfo.symbol} ${tokenInfo.address}`}
    </div>
  )
}

export default TokenSelect
