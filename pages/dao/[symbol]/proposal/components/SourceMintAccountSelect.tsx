import Select from '@components/inputs/Select'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { GovernedMintInfoAccount } from '@utils/tokens'
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
  mintGovernances: GovernedMintInfoAccount[]
  shouldBeGoverned
  governance: ParsedAccount<Governance> | null | undefined
}) => {
  return (
    <Select
      label="Mint"
      onChange={onChange}
      placeholder="Please select..."
      value={value}
      error={error}
    >
      {mintGovernances
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x?.governance?.pubkey.toBase58() ===
              governance?.pubkey?.toBase58()
        )
        .map((acc) => {
          return (
            <Select.Option
              key={acc.governance?.info.governedAccount.toBase58()}
              value={acc}
            >
              {acc.governance?.info.governedAccount.toBase58()}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default SourceMintAccountSelect
