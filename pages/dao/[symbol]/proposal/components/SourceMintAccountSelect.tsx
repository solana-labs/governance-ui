import Select from '@components/inputs/Select'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import React from 'react'

const SourceMintAccountSelect = ({
  onChange,
  value,
  error,
  mintGovernances = [],
  shouldBeGoverned,
  governance,
}: {
  onChange
  value
  error
  mintGovernances: ParsedAccount<Governance>[]
  shouldBeGoverned
  governance: ParsedAccount<Governance> | null | undefined
}) => {
  return (
    <Select
      label="Source account"
      onChange={onChange}
      placeholder="Please select..."
      value={value}
      error={error}
    >
      {mintGovernances
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x?.pubkey.toBase58() === governance?.pubkey?.toBase58()
        )
        .map((acc) => {
          return (
            <Select.Option key={acc.pubkey.toBase58()} value={acc}>
              {acc.info.governedAccount.toBase58()}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default SourceMintAccountSelect
