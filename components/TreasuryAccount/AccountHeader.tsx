import useTotalTokenValue from '@hooks/useTotalTokenValue'
import { BN } from '@coral-xyz/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import BaseAccountHeader from './BaseAccountHeader'
import { useRealmDigitalAssetsQuery } from '@hooks/queries/digitalAssets'
import { useMemo } from 'react'

const AccountHeader = () => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const { data: nfts } = useRealmDigitalAssetsQuery()
  const nftsCount = useMemo(
    () =>
      nfts
        ?.flat()
        .filter(
          (x) =>
            x.ownership.owner ===
              currentAccount?.governance.pubkey.toString() ||
            x.ownership.owner ===
              currentAccount?.extensions.transferAddress?.toString()
        ).length ?? 0,
    [
      currentAccount?.extensions.transferAddress,
      currentAccount?.governance.pubkey,
      nfts,
    ]
  )
  const isNFT = currentAccount?.isNft
  const tokenInfo = useTreasuryAccountStore((s) => s.tokenInfo)
  const amount =
    currentAccount && currentAccount.extensions.mint?.account
      ? getMintDecimalAmountFromNatural(
          currentAccount.extensions.mint?.account,
          new BN(
            !currentAccount.isSol
              ? currentAccount.extensions.token!.account.amount
              : currentAccount.extensions.solAccount!.lamports
          )
        ).toNumber()
      : 0
  const amountFormatted = new BigNumber(amount).toFormat()
  const mintAddress = useTreasuryAccountStore((s) => s.mintAddress)
  const totalPrice = useTotalTokenValue({ amount, mintAddress })
  return (
    <BaseAccountHeader
      mintAddress={mintAddress}
      isNFT={isNFT}
      tokenInfo={tokenInfo}
      amountFormatted={isNFT ? nftsCount?.toString() : amountFormatted}
      totalPrice={totalPrice}
    ></BaseAccountHeader>
  )
}

export default AccountHeader
