import { BigNumber } from 'bignumber.js'

import { AssetAccount } from '@utils/uiTypes/assets'
import tokenPriceService from '@utils/services/tokenPrice'
import { getAccountAssetCount } from './getAccountAssetCount'

export const getAccountValue = (account: AssetAccount) => {
  if (!account.extensions.mint) {
    return new BigNumber(0)
  }

  const count = getAccountAssetCount(account)
  const value = new BigNumber(
    tokenPriceService.getUSDTokenPrice(
      account.extensions.mint.publicKey.toBase58()
    )
  )

  return count.multipliedBy(value)
}
