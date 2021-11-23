import { getMintMetadata } from '@components/instructions/programs/splToken'
import useInstructions from '@hooks/useInstructions'
import {
  formatMintNaturalAmountAsDecimal,
  numberWithCommas,
} from '@tools/sdk/units'
import priceService from '@utils/services/price'
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
            priceService.getTokenPrice(
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
  return totalPrice ? <div className="mb-5">{totalPrice} $</div> : null
}

export default HoldTokensTotalPrice
