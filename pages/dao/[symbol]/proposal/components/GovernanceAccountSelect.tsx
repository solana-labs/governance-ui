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
  autoSelectFirst = true,
}: {
  onChange
  value
  error?
  governanceAccounts: ProgramAccount<Governance>[]
  label?
  noMaxWidth?: boolean
  autoSelectFirst?: boolean
}) => {
  useEffect(() => {
    if (governanceAccounts.length == 1 && autoSelectFirst) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(governanceAccounts[0])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
