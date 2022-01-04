import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import nftLogo from 'public/img/nft-logo.jpeg'

const AccountHeader = () => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const nftsCount = useTreasuryAccountStore((s) => s.compact.nftsCount)
  const isNFT =
    currentAccount?.mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  const [totalPrice, setTotalPrice] = useState('')
  const amount =
    currentAccount && currentAccount.mint?.account
      ? getMintDecimalAmountFromNatural(
          currentAccount.mint?.account,
          new BN(currentAccount.token!.account.amount)
        ).toNumber()
      : 0
  const amountFormatted = new BigNumber(amount).toFormat()
  const mintAddress = useTreasuryAccountStore((s) => s.compact.mintAddress)
  function handleSetTotalPrice() {
    const price = tokenService.getUSDTokenPrice(mintAddress)
    const totalPrice = amount * price
    const totalPriceFormatted = amount
      ? new BigNumber(totalPrice).toFormat(0)
      : ''
    setTotalPrice(totalPriceFormatted)
  }
  useEffect(() => {
    handleSetTotalPrice()
  }, [currentAccount])
  return (
    <div className="bg-bkg-1 mb-4 px-4 py-2 rounded-md w-full flex items-center">
      {(tokenInfo?.logoURI || isNFT) && (
        <img
          className="flex-shrink-0 h-6 w-6 mr-2.5 rounded-full"
          src={isNFT ? nftLogo.src : tokenInfo?.logoURI}
        />
      )}
      <div>
        <p className="text-fgd-3 text-xs">
          {isNFT ? nftsCount : amountFormatted}{' '}
          {!isNFT ? tokenInfo?.symbol : 'NFTS'}
        </p>
        <h3 className="mb-0">
          {totalPrice && totalPrice !== '0' ? <>${totalPrice}</> : ''}
        </h3>
      </div>
    </div>
  )
}

export default AccountHeader
