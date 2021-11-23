import { GovernanceAccountType } from '@models/accounts'
import { numberWithCommas } from '@tools/sdk/units'
import priceService from '@utils/services/price'
import {
  getMintAccountLabelInfo,
  getTokenAccountLabelInfo,
  GovernedMultiTypeAccount,
} from '@utils/tokens'
import { useEffect, useState } from 'react'
const TreasuryAccountItem = ({
  governedAccount,
}: {
  governedAccount: GovernedMultiTypeAccount
}) => {
  const [totalPrice, setTotalPrice] = useState('')
  let account = ''
  let tokenName = ''
  let accountName = ''
  let amount = ''
  let supply = ''
  const accountType = governedAccount.governance.info.accountType
  if (accountType === GovernanceAccountType.MintGovernance) {
    const mintLabelInfo = getMintAccountLabelInfo(governedAccount)
    account = mintLabelInfo.account
    tokenName = mintLabelInfo.tokenName
    accountName = mintLabelInfo.mintAccountName
    supply = mintLabelInfo.amount
  } else {
    const tokenLabelInfo = getTokenAccountLabelInfo(governedAccount)
    account = tokenLabelInfo.tokenAccount
    tokenName = tokenLabelInfo.tokenName
    accountName = tokenLabelInfo.tokenAccountName
    amount = tokenLabelInfo.amount
  }
  function handleSetTotalPrice() {
    const price = priceService.getTokenPrice(tokenName)
    const amountNumber = parseFloat(amount.split(',').join(''))
    const totalPrice = amountNumber
      ? numberWithCommas((amountNumber * price).toFixed(0))
      : ''
    setTotalPrice(totalPrice)
  }
  useEffect(() => {
    handleSetTotalPrice()
  }, [tokenName, amount])
  return account ? (
    <div className="break-all text-fgd-1 bg-bkg-1 px-4 py-2 rounded-md w-full mb-5">
      {accountName && <div className="mb-0.5">{accountName}</div>}
      <div className="mb-2">{account}</div>
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
        {amount !== '' ? (
          <div>Amount: {amount}</div>
        ) : (
          <div>Supply: {supply}</div>
        )}
        {totalPrice && `Value: ${totalPrice} $`}
      </div>
    </div>
  ) : null
}

export default TreasuryAccountItem
