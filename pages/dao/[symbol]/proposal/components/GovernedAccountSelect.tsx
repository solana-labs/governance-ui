import Select from '@components/inputs/Select'
import { Governance, GovernanceAccountType } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import {
  getMintAccountLabelInfo,
  getTokenAccountLabelInfo,
  GovernedMultiTypeAccount,
} from '@utils/tokens'
import React, { useEffect } from 'react'
import { getProgramName } from '@components/instructions/programs/names'

const GovernedAccountSelect = ({
  onChange,
  value,
  error,
  governedAccounts = [],
  shouldBeGoverned,
  governance,
  label,
}: {
  onChange
  value
  error
  governedAccounts: GovernedMultiTypeAccount[]
  shouldBeGoverned
  governance: ParsedAccount<Governance> | null | undefined
  label
}) => {
  function getLabel(value: GovernedMultiTypeAccount) {
    if (value) {
      const accountType = value.governance.info.accountType
      switch (accountType) {
        case GovernanceAccountType.MintGovernance:
          return getMintAccountLabelComponent(getMintAccountLabelInfo(value))
        case GovernanceAccountType.TokenGovernance:
          return getTokenAccountLabelComponent(getTokenAccountLabelInfo(value))
        case GovernanceAccountType.ProgramGovernance:
          return getProgramAccountLabel(value.governance)
        default:
          return value.governance.info.governedAccount.toBase58()
      }
    } else {
      return null
    }
  }
  function getMintAccountLabelComponent({
    account,
    tokenName,
    mintAccountName,
    amount,
  }) {
    return (
      <div className="break-all text-fgd-1">
        {account && <div className="mb-0.5">{account}</div>}
        <div className="mb-2">{mintAccountName}</div>
        <div className="space-y-0.5 text-xs text-fgd-3">
          {tokenName && (
            <div className="flex items-center">
              Token:{' '}
              <img
                className="flex-shrink-0 h-4 mx-1 w-4"
                src={`/icons/${tokenName.toLowerCase()}.svg`}
              />
              {tokenName}
            </div>
          )}
          <div>Supply: {amount}</div>
        </div>
      </div>
    )
  }
  function getTokenAccountLabelComponent({
    tokenAccount,
    tokenAccountName,
    tokenName,
    amount,
  }) {
    return (
      <div className="break-all text-fgd-1 ">
        {tokenAccountName && <div className="mb-0.5">{tokenAccountName}</div>}
        <div className="mb-2">{tokenAccount}</div>
        <div className="space-y-0.5 text-xs text-fgd-3">
          {tokenName && (
            <div className="flex items-center">
              Token:{' '}
              <img
                className="flex-shrink-0 h-4 mx-1 w-4"
                src={`/icons/${tokenName.toLowerCase()}.svg`}
              />
              {tokenName}
            </div>
          )}
          <div>Amount: {amount}</div>
        </div>
      </div>
    )
  }
  function getProgramAccountLabel(val: ParsedAccount<Governance>) {
    const name = val ? getProgramName(val.info.governedAccount) : ''
    return (
      <>
        {name && <div>{name}</div>}
        <div>{val?.info?.governedAccount?.toBase58()}</div>
      </>
    )
  }
  useEffect(() => {
    if (governedAccounts.length == 1) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(governedAccounts[0])
      })
    }
  }, [JSON.stringify(governedAccounts)])
  return (
    <Select
      label={label}
      onChange={onChange}
      componentLabel={getLabel(value)}
      placeholder="Please select..."
      value={value?.governance?.info.governedAccount.toBase58()}
      error={error}
    >
      {governedAccounts
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
              {getLabel(acc)}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default GovernedAccountSelect
