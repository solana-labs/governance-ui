import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'

const AccountHeader = () => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const nftsCount =
    currentAccount?.governance && currentAccount.isNft
      ? governanceNfts[currentAccount?.governance?.pubkey.toBase58()]?.length
      : 0
  const isNFT = currentAccount?.isNft
  const tokenInfo = useTreasuryAccountStore((s) => s.tokenInfo)
  const [totalPrice, setTotalPrice] = useState('')
  const amount =
    currentAccount && currentAccount.mint?.account
      ? getMintDecimalAmountFromNatural(
          currentAccount.mint?.account,
          new BN(
            !currentAccount.isSol
              ? currentAccount.token!.account.amount
              : currentAccount.solAccount!.lamports
          )
        ).toNumber()
      : 0
  const amountFormatted = new BigNumber(amount).toFormat()
  const mintAddress = useTreasuryAccountStore((s) => s.mintAddress)
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
    <div className="bg-bkg-1 mb-4 p-4 rounded-md w-full flex items-center">
      {(tokenInfo?.logoURI || isNFT) && (
        <img
          className={`flex-shrink-0 h-8 w-8 mr-2.5 ${!isNFT && 'rounded-full'}`}
          src={isNFT ? '/img/collectablesIcon.svg' : tokenInfo?.logoURI}
        />
      )}
      <div>
        <h3 className="mb-0 text-xl">
          {isNFT ? nftsCount : amountFormatted}{' '}
          <span className="font-normal text-sm text-fgd-3">
            {!isNFT ? tokenInfo?.symbol : 'NFTS'}
          </span>
        </h3>
        <p className="text-fgd-3 text-sm">
          {totalPrice && totalPrice !== '0' ? <>${totalPrice}</> : ''}
        </p>
      </div>
    </div>
  )
}

export default AccountHeader
