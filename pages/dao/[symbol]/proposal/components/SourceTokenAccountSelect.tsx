import Select from '@components/inputs/Select'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { getAccountName } from '@components/instructions/tools'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import { GovernedTokenAccount } from '@utils/tokens'
import React from 'react'

//TODO more generic with own data fetch
const SourceTokenAccountSelect = ({
  onChange,
  value,
  error,
  governedTokenAccounts = [],
  shouldBeGoverned,
  governance,
}: {
  onChange
  value
  error
  governedTokenAccounts: GovernedTokenAccount[]
  shouldBeGoverned
  governance: ParsedAccount<Governance> | null | undefined
}) => {
  const getGovernedTokenAccountLabelInfo = (
    acc: GovernedTokenAccount | undefined
  ) => {
    let tokenAccount = ''
    let tokenName = ''
    let tokenAccountName = ''
    let amount = ''

    if (acc?.token) {
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
  const getGovernedTokenAccountLabel = () => {
    if (value) {
      const acc = governedTokenAccounts.find(
        (x) => x.token?.account?.address.toBase58() === value
      )
      const {
        tokenAccount,
        tokenAccountName,
        tokenName,
        amount,
      } = getGovernedTokenAccountLabelInfo(acc)

      return returnLabelComponent({
        tokenAccount,
        tokenAccountName,
        tokenName,
        amount,
      })
    } else {
      return null
    }
  }
  const returnLabelComponent = ({
    tokenAccount,
    tokenAccountName,
    tokenName,
    amount,
  }) => {
    return (
      <div>
        <div>{tokenAccount}</div>
        {tokenAccountName && <div>{tokenAccountName}</div>}
        {tokenName && <div>token: {tokenName}</div>}
        <div>amount: {amount}</div>
      </div>
    )
  }
  return (
    <Select
      className="h-24"
      prefix="Source Account"
      onChange={onChange}
      componentLabel={getGovernedTokenAccountLabel()}
      value={value}
      error={error}
    >
      {governedTokenAccounts
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x.governance?.pubkey.toBase58() === governance?.pubkey?.toBase58()
        )
        .map((acc) => {
          const {
            tokenAccount,
            tokenAccountName,
            tokenName,
            amount,
          } = getGovernedTokenAccountLabelInfo(acc)
          return (
            <Select.Option key={tokenAccount} value={acc}>
              {returnLabelComponent({
                tokenAccount,
                tokenAccountName,
                tokenName,
                amount,
              })}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default SourceTokenAccountSelect
