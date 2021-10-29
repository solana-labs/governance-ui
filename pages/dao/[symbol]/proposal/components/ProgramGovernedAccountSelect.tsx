import Select from '@components/inputs/Select'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import React from 'react'

const ProgramGovernedAccountSelect = ({
  onChange,
  value,
  error,
  programGovernances = [],
  shouldBeGoverned,
  governance,
}: {
  onChange
  value
  error
  programGovernances: ParsedAccount<Governance>[]
  shouldBeGoverned
  governance: ParsedAccount<Governance> | null | undefined
}) => {
  return (
    <Select
      label="Program (governed account)"
      onChange={onChange}
      placeholder="Please select..."
      value={value}
      error={error}
    >
      {programGovernances
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x.pubkey?.toBase58() === governance?.pubkey?.toBase58()
        )
        .map((acc) => {
          return (
            <Select.Option
              key={acc.info.governedAccount.toBase58()}
              value={acc}
            >
              {acc.info.governedAccount.toBase58()}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default ProgramGovernedAccountSelect
