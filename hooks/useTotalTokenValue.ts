import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'

const useTotalTokenValue = ({
  amount,
  mintAddress,
}: {
  amount: number
  mintAddress: string
}) => {
  const [totalValue, setTotalValue] = useState('')

  useEffect(() => {
    const price = tokenService.getUSDTokenPrice(mintAddress)
    const totalPrice = amount * price
    const totalPriceFormatted = amount
      ? new BigNumber(totalPrice).toFormat(0)
      : ''
    setTotalValue(totalPriceFormatted)
  }, [amount, mintAddress])

  return totalValue
}
export default useTotalTokenValue
