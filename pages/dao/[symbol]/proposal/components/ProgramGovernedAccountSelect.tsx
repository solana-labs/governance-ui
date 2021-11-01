import Select from '@components/inputs/Select'
import { getProgramName } from '@components/instructions/programs/names'
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
  value: ParsedAccount<Governance> | undefined
  error
  programGovernances: ParsedAccount<Governance>[]
  shouldBeGoverned
  governance: ParsedAccount<Governance> | null | undefined
}) => {
  const returnLabel = (val) => {
    const name = val ? getProgramName(val.info.governedAccount) : ''
    return (
      <>
        {name && <div>{name}</div>}
        <div>{val?.info?.governedAccount?.toBase58()}</div>
      </>
    )
  }
  return (
    <Select
      label="Program (governed account)"
      onChange={onChange}
      placeholder="Please select..."
      value={value?.info?.governedAccount.toBase58()}
      error={error}
      componentLabel={returnLabel(value)}
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
              {returnLabel(acc)}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default ProgramGovernedAccountSelect
