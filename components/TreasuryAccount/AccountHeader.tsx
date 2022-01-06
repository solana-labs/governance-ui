import { getExplorerUrl } from '@components/explorer/tools'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { BN } from '@project-serum/anchor'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'

const AccountHeader = () => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const connection = useWalletStore((s) => s.connection)
  const nftsCount = useTreasuryAccountStore((s) => s.compact.nftsCount)
  const isNFT =
    currentAccount?.mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT
  const address = isNFT
    ? currentAccount.governance?.pubkey.toBase58()
    : currentAccount?.token?.publicKey.toBase58()
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
      <a
        className="ml-auto self-start"
        href={address ? getExplorerUrl(connection.endpoint, address) : ''}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
      </a>
    </div>
  )
}

export default AccountHeader
