import { BigNumber } from 'bignumber.js'

export const calculateTotalValue = (values: BigNumber[]) => {
  let total = new BigNumber(0)

  for (const value of values.values()) {
    total = total.plus(value)
  }

  return total
}
