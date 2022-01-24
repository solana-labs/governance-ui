import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'

const HoldTokensTotalPrice = () => {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [totalPriceFormatted, setTotalPriceFormatted] = useState('')
  useEffect(() => {
    async function calcTotalTokensPrice() {
      const totalPrice = governedTokenAccountsWithoutNfts
        .filter(
          (x) => typeof x.mint !== 'undefined' && typeof x.token !== 'undefined'
        )
        .map((x) => {
          return (
            getMintDecimalAmountFromNatural(
              x.mint!.account,
              new BN(x.token!.account.amount)
            ).toNumber() *
            tokenService.getUSDTokenPrice(x.token!.account.mint.toBase58())
          )
        })
        .reduce((acc, val) => acc + val, 0)

      setTotalPriceFormatted(
        totalPrice ? new BigNumber(totalPrice).toFormat(0) : ''
      )
    }
    if (governedTokenAccountsWithoutNfts.length) {
      calcTotalTokensPrice()
    }
  }, [
    JSON.stringify(governedTokenAccountsWithoutNfts),
    JSON.stringify(tokenService._tokenPriceToUSDlist),
  ])
  return totalPriceFormatted ? (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
      <p className="text-fgd-3 text-xs">Treasury Balance</p>
      <h3 className="mb-0">${totalPriceFormatted}</h3>
    </div>
  ) : null
}

export default HoldTokensTotalPrice
