import { BN } from '@coral-xyz/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenPriceService from '@utils/services/tokenPrice'
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
            tokenPriceService.getUSDTokenPrice(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    JSON.stringify(governedTokenAccountsWithoutNfts),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    JSON.stringify(tokenPriceService._tokenPriceToUSDlist),
  ])

  return {
    totalPriceFormatted,
  }
}
