import Select from '@components/inputs/Select'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import React, { useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { web3 } from '@project-serum/anchor'

export enum StakeState {
  Active,
  Inactive,
}

export interface StakeAccount {
  stakeAccount: PublicKey
  state: StakeState
  delegatedValidator: PublicKey | null
  amount: number
}

export function getStakeAccountLabelInfo(acc: StakeAccount | undefined) {
  let stakeAccount = ''
  let accountStatus = ''
  let delegatedValidator = ''
  let amount = ''

  if (acc?.stakeAccount) {
    stakeAccount = acc.stakeAccount.toString()
    accountStatus = acc.state == StakeState.Active ? 'Active' : 'Deactive'
    delegatedValidator = acc.delegatedValidator
      ? acc.delegatedValidator.toString()
      : ''
    amount = acc.amount.toString()
  }
  return {
    stakeAccount,
    accountStatus,
    delegatedValidator,
    amount,
  }
}

export const StakeAccountSelect = ({
  onChange,
  value,
  error,
  stakeAccounts = [],
  label,
  noMaxWidth,
  autoselectFirst = true,
}: {
  onChange
  value
  error?
  stakeAccounts: StakeAccount[]
  shouldBeGoverned?
  governance?: ProgramAccount<Governance> | null | undefined
  label?
  noMaxWidth?: boolean
  autoselectFirst?: boolean
}) => {
  function getLabel(value: StakeAccount) {
    if (value) {
      return getStakeLabelComponent(getStakeAccountLabelInfo(value))
    } else {
      return null
    }
  }
  function getStakeLabelComponent({
    stakeAccount,
    accountStatus,
    delegatedValidator,
    amount,
  }) {
    return (
      <div className="break-all text-fgd-1 ">
        {stakeAccount && <div className="mb-0.5">{stakeAccount}</div>}
        <div className="mb-2 text-fgd-3 text-xs">{accountStatus}</div>
        <div className="flex space-x-3 text-xs text-fgd-3">
          <div className="flex items-center">
            Amount:
            <span className="ml-1 text-fgd-1">{amount}</span>
          </div>
        </div>
        <div className="flex space-x-3 text-xs text-fgd-3">
          {delegatedValidator && delegatedValidator != web3.PublicKey.default && (
            <div>
              Vote Key:
              <span className="ml-1 text-fgd-1">{delegatedValidator}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
  useEffect(() => {
    if (stakeAccounts.length == 1 && autoselectFirst) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(stakeAccounts[0])
      })
    }
  }, [JSON.stringify(stakeAccounts)])
  return (
    <Select
      label={label}
      onChange={onChange}
      componentLabel={getLabel(value)}
      placeholder="Please select..."
      value={value?.stakeAccount.toBase58()}
      error={error}
      noMaxWidth={noMaxWidth}
    >
      {stakeAccounts.map((acc) => {
        return (
          <Select.Option
            className="border-red"
            key={acc.stakeAccount.toBase58()}
            value={acc}
          >
            {getLabel(acc)}
          </Select.Option>
        )
      })}
    </Select>
  )
}
