import Select from '@components/inputs/Select'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { getAccountName } from '@components/instructions/tools'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
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
  const getGovernedTokenAccountLabelInfo = (
    acc: GovernedMintInfoAccount | undefined
  ) => {
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
  const returnLabelComponent = ({
    account,
    tokenName,
    mintAccountName,
    amount,
  }) => {
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
  return (
    <Select
      label="Mint"
      onChange={onChange}
      componentLabel={
        value
          ? returnLabelComponent(getGovernedTokenAccountLabelInfo(value))
          : null
      }
      placeholder="Please select..."
      value={value?.governance?.info.governedAccount.toBase58()}
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
          const {
            account,
            tokenName,
            mintAccountName,
            amount,
          } = getGovernedTokenAccountLabelInfo(acc)
          return (
            <Select.Option
              key={acc.governance?.info.governedAccount.toBase58()}
              value={acc}
            >
              {returnLabelComponent({
                account,
                tokenName,
                mintAccountName,
                amount,
              })}
            </Select.Option>
          )
        })}
    </Select>
  )
}

export default SourceMintAccountSelect
