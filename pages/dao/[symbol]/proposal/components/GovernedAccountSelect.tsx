import Select from '@components/inputs/Select'
import {
  Governance,
  GovernanceAccountType,
  ProgramAccount,
} from '@solana/spl-governance'
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
  useDefaultStyle = true,
  className = '',
  noMaxWidth = false,
}: {
  onChange
  value
  error
  governedAccounts: GovernedMultiTypeAccount[]
  shouldBeGoverned
  governance: ProgramAccount<Governance> | null | undefined
  label
  useDefaultStyle?: boolean
  className?: string
  noMaxWidth?: boolean
}) => {
  function getLabel(value: GovernedMultiTypeAccount) {
    if (value) {
      const accountType = value.governance.account.accountType
      switch (accountType) {
        case GovernanceAccountType.MintGovernance:
          return getMintAccountLabelComponent(getMintAccountLabelInfo(value))
        case GovernanceAccountType.TokenGovernance:
          return getTokenAccountLabelComponent(getTokenAccountLabelInfo(value))
        case GovernanceAccountType.ProgramGovernance:
          return getProgramAccountLabel(value.governance)
        default:
          return value.governance.account.governedAccount.toBase58()
      }
    }

    return null
  }

  //TODO refactor both methods (getMintAccountLabelComponent, getTokenAccountLabelComponent) make it more common
  function getMintAccountLabelComponent({
    account,
    tokenName,
    mintAccountName,
    amount,
    imgUrl,
  }) {
    return (
      <div className="break-all text-fgd-1">
        {account && <div className="mb-0.5">{account}</div>}
        <div className="mb-2">{mintAccountName}</div>
        <div className="space-y-0.5 text-xs text-fgd-3">
          {tokenName && (
            <div className="flex items-center">
              Token: <img className="flex-shrink-0 h-4 mx-1 w-4" src={imgUrl} />
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
    imgUrl,
  }) {
    return (
      <div className="break-all text-fgd-1 ">
        {tokenAccountName && <div className="mb-0.5">{tokenAccountName}</div>}
        <div className="mb-2">{tokenAccount}</div>
        <div className="space-y-0.5 text-xs text-fgd-3">
          {tokenName && (
            <div className="flex items-center">
              Token: <img className="flex-shrink-0 h-4 mx-1 w-4" src={imgUrl} />
              {tokenName}
            </div>
          )}
          <div>Amount: {amount}</div>
        </div>
      </div>
    )
  }
  function getProgramAccountLabel(val: ProgramAccount<Governance>) {
    const name = val ? getProgramName(val.account.governedAccount) : ''
    return (
      <div className="flex flex-col">
        {name && <div>{name}</div>}
        <div>{val?.account?.governedAccount?.toBase58()}</div>
      </div>
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
      useDefaultStyle={useDefaultStyle}
      className={
        className ||
        'p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none'
      }
      label={label}
      onChange={onChange}
      componentLabel={getLabel(value)}
      placeholder="Please select..."
      value={value?.governance?.account.governedAccount.toBase58()}
      error={error}
      noMaxWidth={noMaxWidth}
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
              className="bg-bkg-3"
              key={acc.governance?.account.governedAccount.toBase58()}
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
