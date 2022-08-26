import { BigNumber } from 'bignumber.js'

import { AssetAccount } from '@utils/uiTypes/assets'
import tokenService from '@utils/services/token'
import { getAccountAssetCount } from './getAccountAssetCount'

export const getAccountValue = (account: AssetAccount) => {
  if (!account.extensions.mint) {
    return new BigNumber(0)
  }

  const count = getAccountAssetCount(account)
  const value = new BigNumber(
    tokenService.getUSDTokenPrice(account.extensions.mint.publicKey.toBase58())
  )

  return count.multipliedBy(value)
}
