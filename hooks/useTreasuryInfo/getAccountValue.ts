import { BigNumber } from 'bignumber.js'

import { AssetAccount } from '@utils/uiTypes/assets'
import { getAccountAssetCount } from './getAccountAssetCount'
import { getJupiterPriceSync } from '@hooks/queries/jupiterPrice'
import { WSOL_MINT } from '@components/instructions/tools'
import { PublicKey } from '@metaplex-foundation/js'

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

export const getStakeAccountValue = (account: AssetAccount) => {
  const count = new BigNumber(account.extensions.stake?.amount || 0)
  const value = new BigNumber(getJupiterPriceSync(new PublicKey(WSOL_MINT)))

  return count.multipliedBy(value)
}
