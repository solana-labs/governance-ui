import Select from '@components/inputs/Select'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { getAccountName } from '@components/instructions/tools'
import { Governance, GovernanceAccountType } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import React from 'react'
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
  function returnLabel(value: GovernedMultiTypeAccount) {
    if (value) {
      const accountType = value.governance.info.accountType
      switch (accountType) {
        case GovernanceAccountType.MintGovernance:
          return returnMintAccountLabelComponent(getMintAccountLabelInfo(value))
        case GovernanceAccountType.TokenGovernance:
          return returnTokenAccountLabelComponent(
            getTokenAccountLabelInfo(value)
          )
        case GovernanceAccountType.ProgramGovernance:
          return returnProgramAccountLabel(value.governance)
      }
    } else {
      return null
    }
  }
  function getMintAccountLabelInfo(acc: GovernedMultiTypeAccount | undefined) {
    let account = ''
    let tokenName = ''
    let mintAccountName = ''
    let amount = ''

    if (acc?.mintInfo && acc.governance) {
      account = acc.governance?.info.governedAccount.toBase58()
      tokenName = getMintMetadata(acc.governance?.info.governedAccount)?.name
      mintAccountName = getAccountName(acc.governance.info.governedAccount)
      amount = formatMintNaturalAmountAsDecimal(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc.mintInfo,
        acc?.mintInfo.supply
      )
    }
    return {
      account,
      tokenName,
      mintAccountName,
      amount,
    }
  }
  function returnMintAccountLabelComponent({
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
  function getTokenAccountLabelInfo(acc: GovernedMultiTypeAccount | undefined) {
    let tokenAccount = ''
    let tokenName = ''
    let tokenAccountName = ''
    let amount = ''

    if (acc?.token && acc.mint) {
      tokenAccount = acc.token.publicKey.toBase58()
      tokenName = getMintMetadata(acc.token.account.mint)?.name
      tokenAccountName = getAccountName(acc.token.publicKey)
      amount = formatMintNaturalAmountAsDecimal(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc.mint!.account,
        acc.token?.account.amount
      )
    }
    return {
      tokenAccount,
      tokenName,
      tokenAccountName,
      amount,
    }
  }
  function returnTokenAccountLabelComponent({
    tokenAccount,
    tokenAccountName,
    tokenName,
    amount,
  }) {
    return (
      <div className="break-all text-fgd-1">
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
  function returnProgramAccountLabel(val: ParsedAccount<Governance>) {
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
      label={label}
      onChange={onChange}
      componentLabel={returnLabel(value)}
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
              {returnLabel(acc)}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default GovernedAccountSelect
