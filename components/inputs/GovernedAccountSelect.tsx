import Select from '@components/inputs/Select'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  getMintAccountLabelInfo,
  getSolAccountLabel,
  getTokenAccountLabelInfo,
} from '@utils/tokens'
import React, { useEffect } from 'react'
import { getProgramName } from '@components/instructions/programs/names'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'

const GovernedAccountSelect = ({
  onChange,
  value,
  error,
  governedAccounts = [],
  shouldBeGoverned,
  governance,
  label,
  noMaxWidth,
  autoSelectFirst = true,
}: {
  onChange
  value
  error?
  governedAccounts: AssetAccount[]
  shouldBeGoverned?: boolean
  governance?: ProgramAccount<Governance> | null | undefined
  label?
  noMaxWidth?: boolean
  autoSelectFirst?: boolean
}) => {
  function getLabel(value: AssetAccount) {
    if (value) {
      if (value.isSol || value.isToken) {
        return getTokenAccountLabelComponent(
          value.isSol
            ? getSolAccountLabel(value)
            : getTokenAccountLabelInfo(value)
        )
      } else {
        switch (value.type) {
          case AccountType.MINT:
            return getMintAccountLabelComponent(getMintAccountLabelInfo(value))
          case AccountType.PROGRAM:
            return getProgramAccountLabel(value)
          default:
            return (
              value.extensions.transferAddress?.toBase58() ||
              value.pubkey.toBase58()
            )
        }
      }
    } else {
      return null
    }
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
  }) {
    return (
      <div className="break-all text-fgd-1 ">
        {tokenAccountName && <div className="mb-0.5">{tokenAccountName}</div>}
        <div className="mb-2 text-fgd-3 text-xs">{tokenAccount}</div>
        <div className="flex space-x-3 text-xs text-fgd-3">
          {tokenName && (
            <div className="flex items-center">
              Token:
              <span className="ml-1 text-fgd-1">{tokenName}</span>
            </div>
          )}
          <div>
            Bal:<span className="ml-1 text-fgd-1">{amount}</span>
          </div>
        </div>
      </div>
    )
  }
  function getProgramAccountLabel(val: AssetAccount) {
    const name = val ? getProgramName(val.pubkey) : ''
    return (
      <div className="flex flex-col">
        {name && <div>{name}</div>}
        <div>{val?.pubkey?.toBase58()}</div>
      </div>
    )
  }
  useEffect(() => {
    if (governedAccounts.length == 1 && autoSelectFirst) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(governedAccounts[0])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(governedAccounts)])
  return (
    <Select
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
              className="border-red"
              key={acc.pubkey.toBase58()}
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
