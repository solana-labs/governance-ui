import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { ukraineDAONftGovPk } from '@utils/tokens'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'

const AccountHeader = () => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  //Just for ukraine dao, it will be replaced with good abstraction
  const nftsCount =
    currentAccount?.governance?.pubkey.toBase58() === ukraineDAONftGovPk
      ? useTreasuryAccountStore((s) => s.allNfts).length
      : currentAccount?.governance && currentAccount.isNft
      ? useTreasuryAccountStore((s) => s.governanceNfts)[
          currentAccount?.governance?.pubkey.toBase58()
        ]?.length
      : 0
  const isNFT = currentAccount?.isNft
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
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
          className={`flex-shrink-0 h-5 w-5 mr-2.5 ${!isNFT && 'rounded-full'}`}
          src={isNFT ? '/img/collectablesIcon.svg' : tokenInfo?.logoURI}
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
