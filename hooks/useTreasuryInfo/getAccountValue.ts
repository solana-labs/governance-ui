import { BigNumber } from 'bignumber.js'

import { AssetAccount } from '@utils/uiTypes/assets'
import { getAccountAssetCount } from './getAccountAssetCount'
import { getJupiterPriceSync } from '@hooks/queries/jupiterPrice'

/** @deprecated */
export const getAccountValue = (account: AssetAccount) => {
  if (!account.extensions.mint) {
    return new BigNumber(0)
  }

  const count = getAccountAssetCount(account)
  const value = new BigNumber(
    getJupiterPriceSync(account.extensions.mint.publicKey)
  )

  return count.multipliedBy(value)
}
