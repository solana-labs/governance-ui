import { BN } from '@coral-xyz/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import useGovernanceAssets from './useGovernanceAssets'
import { useJupiterPricesByMintsQuery } from './queries/jupiterPrice'
import { PublicKey } from '@metaplex-foundation/js'
import { WSOL_MINT } from '@components/instructions/tools'

export function useTotalTreasuryPrice() {
  const {
    governedTokenAccountsWithoutNfts,
    assetAccounts,
  } = useGovernanceAssets()

  const mintsToFetch = governedTokenAccountsWithoutNfts
    .filter((x) => typeof x.extensions.mint !== 'undefined')
    .map((x) => x.extensions.mint!.publicKey)

  const { data: prices } = useJupiterPricesByMintsQuery([
    ...mintsToFetch,
    new PublicKey(WSOL_MINT),
  ])

  const totalTokensPrice = governedTokenAccountsWithoutNfts
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
        (prices?.[x.extensions.mint!.publicKey.toBase58()]?.price ?? 0)
      )
    })
    .reduce((acc, val) => acc + val, 0)

  const stakeAccountsTotalPrice = assetAccounts
    .filter((x) => x.extensions.stake)
    .map((x) => {
      return x.extensions.stake!.amount * (prices?.[WSOL_MINT]?.price ?? 0)
    })
    .reduce((acc, val) => acc + val, 0)

  const totalPrice = totalTokensPrice + stakeAccountsTotalPrice

  const totalPriceFormatted = governedTokenAccountsWithoutNfts.length
    ? new BigNumber(totalPrice).toFormat(0)
    : ''

  return {
    totalPriceFormatted,
  }
}
