import { BN } from '@coral-xyz/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import useGovernanceAssets from './useGovernanceAssets'
import { useJupiterPricesByMintsQuery } from './queries/jupiterPrice'

export function useTotalTreasuryPrice() {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()

  const mintsToFetch = governedTokenAccountsWithoutNfts
    .filter((x) => typeof x.extensions.mint !== 'undefined')
    .map((x) => x.extensions.mint!.publicKey)

  const { data: prices } = useJupiterPricesByMintsQuery(mintsToFetch)

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
        (prices?.[x.extensions.mint!.publicKey.toBase58()].price ?? 0)
      )
    })
    .reduce((acc, val) => acc + val, 0)

  const totalPriceFormatted = governedTokenAccountsWithoutNfts.length
    ? new BigNumber(totalPrice).toFormat(0)
    : ''

  return {
    totalPriceFormatted,
  }
}
