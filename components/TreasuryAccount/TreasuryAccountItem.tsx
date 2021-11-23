import { GovernanceAccountType } from '@models/accounts'
import { getBigNumberAmount } from '@tools/sdk/units'
import {
  getMintAccountLabelInfo,
  getTokenAccountLabelInfo,
  GovernedMultiTypeAccount,
} from '@utils/tokens'
import BN from 'bn.js'
import { FC, useEffect, useState } from 'react'
import priceService from 'utils/services/price'
const TreasuryAccountItem: FC<{
  governedAccount: GovernedMultiTypeAccount
}> = ({ governedAccount }) => {
  const [price, setPrice] = useState(0)
  function returnItem(governedAccount: GovernedMultiTypeAccount) {
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
    function getTotalPrice() {}
    useEffect(() => {
      async function getTokenPrice() {
        const price = await priceService.getTokenPriceToUSD(tokenName)
        setPrice(price)
      }
      getTokenPrice()
    }, [])

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
          {`${getTotalPrice()}`}
        </div>
      </div>
    ) : null
  }
  return returnItem(governedAccount)
}

export default TreasuryAccountItem
