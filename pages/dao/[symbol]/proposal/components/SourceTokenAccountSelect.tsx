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
  return (
    <Select
      label="Source account"
      onChange={onChange}
      componentLabel={getGovernedTokenAccountLabel()}
      placeholder="Please select..."
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
