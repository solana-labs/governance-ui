import { BigNumber } from 'bignumber.js'

import { AssetAccount } from '@utils/uiTypes/assets'
import tokenPriceService from '@utils/services/tokenPrice'
import { getAccountAssetCount } from './getAccountAssetCount'
import { WSOL_MINT } from '@components/instructions/tools'

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

export const getStakeAccountValue = (account: AssetAccount) => {
  const count = new BigNumber(account.extensions.stake?.amount || 0)
  const value = new BigNumber(tokenPriceService.getUSDTokenPrice(WSOL_MINT))

  return count.multipliedBy(value)
}
