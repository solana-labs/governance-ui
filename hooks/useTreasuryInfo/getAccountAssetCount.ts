import { BigNumber } from 'bignumber.js'

import { AccountType, AssetAccount } from '@utils/uiTypes/assets'

export const getAccountAssetCount = (account: AssetAccount) => {
  let count = new BigNumber(0)

  if (account.type === AccountType.SOL && account.extensions.solAccount) {
    count = new BigNumber(account.extensions.solAccount.lamports)
  }

  if (account.type === AccountType.TOKEN && account.extensions.token) {
    count = new BigNumber(account.extensions.token.account.amount.toString())
  }

  if (account.extensions.mint) {
    count = count.shiftedBy(-account.extensions.mint.account.decimals)
  }

  return count
}
