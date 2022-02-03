import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useState, useEffect } from 'react'
import useGovernanceAssets from './useGovernanceAssets'

export function useTotalTreasuryPrice() {
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

  return {
    totalPriceFormatted,
  }
}
