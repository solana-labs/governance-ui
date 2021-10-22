import Select from '@components/inputs/Select'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { getAccountName } from '@components/instructions/tools'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import React from 'react'

const SourceAccountSelect = ({
  onChange,
  value,
  error,
  governedTokenAccounts,
  shouldBeGoverned,
  mainGovernance,
}) => {
  const returnGovernanceTokenAccountLabelInfo = (acc) => {
    let govAccount = ''
    let adressAsString = ''
    let tokenName = ''
    let accName = ''
    let amout = ''
    let label = ''
    if (acc.token) {
      govAccount = acc.token.publicKey.toString()
      adressAsString = acc.token.account.address.toString()
      tokenName = getMintMetadata(acc.token.account.mint)?.name
      accName = getAccountName(acc.token.publicKey)
      label = accName ? `${accName}: ${adressAsString}` : adressAsString
      amout = formatMintNaturalAmountAsDecimal(
        acc.mint?.account,
        acc.token?.account.amount
      )
    }
    return {
      govAccount,
      adressAsString,
      tokenName,
      label,
      amout,
    }
  }
  const returnGovernanceTokenAccountLabel = () => {
    if (value) {
      const acc = governedTokenAccounts.find(
        (x) => x.token?.account?.address.toBase58() === value
      )
      const { label, tokenName, amout } = returnGovernanceTokenAccountLabelInfo(
        acc
      )
      return returnlabelComponent({ label, tokenName, amout })
    } else {
      return null
    }
  }
  const returnlabelComponent = ({ label, tokenName, amout }) => {
    return (
      <div>
        <span>{label}</span>
        {tokenName && <div>Token Name: {tokenName}</div>}
        <div>Amount: {amout}</div>
      </div>
    )
  }
  return (
    <Select
      className="h-24"
      prefix="Source Account"
      onChange={onChange}
      componentLabel={returnGovernanceTokenAccountLabel()}
      value={value}
      error={error}
    >
      {governedTokenAccounts
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x.governance?.pubkey.toBase58() ===
              mainGovernance.governance?.pubkey?.toBase58()
        )
        .map((acc) => {
          const {
            govAccount,
            label,
            tokenName,
            amout,
          } = returnGovernanceTokenAccountLabelInfo(acc)
          return (
            <Select.Option key={govAccount} value={acc}>
              {returnlabelComponent({ label, tokenName, amout })}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default SourceAccountSelect
