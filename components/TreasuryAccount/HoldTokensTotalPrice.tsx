import { getMintMetadata } from '@components/instructions/programs/splToken'
import useGovernances from '@hooks/useGovernances'
import {
  formatMintNaturalAmountAsDecimal,
  numberWithCommas,
} from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { useEffect, useState } from 'react'

const HoldTokensTotalPrice = () => {
  const { governedTokenAccounts } = useGovernances()
  const [totalPrice, setTotalPrice] = useState('')
  useEffect(() => {
    async function calcTotalTokensPrice() {
      const totalPrice = governedTokenAccounts
        .filter(
          (x) => typeof x.mint !== 'undefined' && typeof x.token !== 'undefined'
        )
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
  }, [
    JSON.stringify(governedTokenAccounts),
    JSON.stringify(tokenService.tokenPriceToUSDlist),
  ])
  return totalPrice ? (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
      <p className="text-fgd-3 text-xs">Treasury Balance</p>
      <h3 className="mb-0">${totalPrice}</h3>
    </div>
  ) : null
}

export default HoldTokensTotalPrice
