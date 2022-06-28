import Select from '@components/inputs/Select'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import React, { useEffect } from 'react'

const GovernanceAccountSelect = ({
  onChange,
  value,
  error,
  governanceAccounts = [],
  label,
  noMaxWidth,
  autoselectFirst = true,
}: {
  onChange
  value
  error?
  governanceAccounts: ProgramAccount<Governance>[]
  label?
  noMaxWidth?: boolean
  autoselectFirst?: boolean
}) => {
  useEffect(() => {
    if (governanceAccounts.length == 1 && autoselectFirst) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(governanceAccounts[0])
      })
    }
  }, [JSON.stringify(governanceAccounts)])
  return (
    <Select
      label={label}
      onChange={onChange}
      componentLabel={value?.pubkey?.toBase58()}
      placeholder="Please select..."
      value={value?.pubkey?.toBase58()}
      error={error}
      noMaxWidth={noMaxWidth}
    >
      {governanceAccounts.map((acc) => {
        return (
          <Select.Option
            className="border-red"
            key={acc.pubkey.toBase58()}
            value={acc}
          >
            {acc.pubkey.toBase58()}
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default GovernanceAccountSelect
