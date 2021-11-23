import { getMintMetadata } from '@components/instructions/programs/splToken'
import useInstructions from '@hooks/useInstructions'
import {
  formatMintNaturalAmountAsDecimal,
  numberWithCommas,
} from '@tools/sdk/units'
import tokenService from '@utils/services/price'
import { useEffect, useState } from 'react'

const HoldTokensTotalPrice = () => {
  const { governedTokenAccounts } = useInstructions()
  const [totalPrice, setTotalPrice] = useState('')
  useEffect(() => {
    async function calcTotalTokensPrice() {
      const totalPrice = governedTokenAccounts
        .filter((x) => typeof x.mint !== 'undefined')
        .map((x) => {
          return (
            parseFloat(
              formatMintNaturalAmountAsDecimal(
                x.mint!.account,
                x.token!.account.amount
              )
                .split(',')
                .join('')
            ) *
            tokenService.getUSDTokenPrice(
              getMintMetadata(x.token!.account.mint)?.name
            )
          )
        })
        .reduce((acc, val) => acc + val, 0)
        .toFixed(0)
      setTotalPrice(totalPrice !== '0' ? numberWithCommas(totalPrice) : '')
    }
    if (governedTokenAccounts.length) {
      calcTotalTokensPrice()
    }
  }, [JSON.stringify(governedTokenAccounts)])
  return totalPrice ? <h3 className="mb-5 text-center">${totalPrice}</h3> : null
}

export default HoldTokensTotalPrice
