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
        .filter((x) => typeof x.extensions.mint !== 'undefined')
        .map((x) => {
          return (
            getMintDecimalAmountFromNatural(
              x.extensions.mint!.account,
              new BN(
                x.isSol
                  ? x.extensions.solAccount!.lamports
                  : x.isToken
                  ? x.extensions.token!.account?.amount
                  : 0
              )
            ).toNumber() *
            tokenService.getUSDTokenPrice(
              x.extensions.mint!.publicKey.toBase58()
            )
          )
        })
        .reduce((acc, val) => acc + val, 0)
      setTotalPriceFormatted(
        totalPrice ? new BigNumber(totalPrice).toFormat(0) : ''
      )
    }
    if (governedTokenAccountsWithoutNfts.length) {
      calcTotalTokensPrice()
    } else {
      setTotalPriceFormatted('')
    }
  }, [
    JSON.stringify(governedTokenAccountsWithoutNfts),
    JSON.stringify(tokenService._tokenPriceToUSDlist),
  ])

  return {
    totalPriceFormatted,
  }
}
