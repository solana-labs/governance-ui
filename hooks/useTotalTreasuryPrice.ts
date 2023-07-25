import { BN } from '@coral-xyz/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenPriceService from '@utils/services/tokenPrice'
import BigNumber from 'bignumber.js'
import { useState, useEffect } from 'react'
import useGovernanceAssets from './useGovernanceAssets'
import { WSOL_MINT } from '@components/instructions/tools'
import { AccountType } from '@utils/uiTypes/assets'

export function useTotalTreasuryPrice() {
  const {
    governedTokenAccountsWithoutNfts,
    assetAccounts,
    auxiliaryTokenAccounts,
  } = useGovernanceAssets()
  const [totalPriceFormatted, setTotalPriceFormatted] = useState('')
  useEffect(() => {
    async function calcTotalTokensPrice() {
      const tokenAccountsTotalPrice = [
        ...governedTokenAccountsWithoutNfts,
        ...auxiliaryTokenAccounts,
      ]
        .filter((x) => typeof x.extensions.mint !== 'undefined')
        .map((x) => {
          return (
            getMintDecimalAmountFromNatural(
              x.extensions.mint!.account,
              new BN(
                x.isSol
                  ? x.extensions.solAccount!.lamports
                  : x.isToken || x.type === AccountType.AUXILIARY_TOKEN
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

      const stakeAccountsTotalPrice = assetAccounts
        .filter((x) => x.extensions.stake)
        .map((x) => {
          return (
            x.extensions.stake!.amount *
            tokenPriceService.getUSDTokenPrice(WSOL_MINT)
          )
        })
        .reduce((acc, val) => acc + val, 0)

      const totalPrice = tokenAccountsTotalPrice + stakeAccountsTotalPrice
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
