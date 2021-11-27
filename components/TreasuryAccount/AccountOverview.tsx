import Button from '@components/Button'
import { getAccountName } from '@components/instructions/tools'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'

const AccountOverview = () => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  const mintAddress = useTreasuryAccountStore((s) => s.compact.mintAddress)

  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useTreasuryAccountStore()
  const [totalPrice, setTotalPrice] = useState('')
  const accountPublicKey = currentAccount
    ? currentAccount.governance?.info.governedAccount
    : null
  const amount =
    currentAccount && currentAccount.mint?.account
      ? getMintDecimalAmountFromNatural(
          currentAccount.mint?.account,
          new BN(currentAccount.token!.account.amount)
        ).toNumber()
      : 0
  const amountFormatted = new BigNumber(amount).toFormat()

  function handleSetTotalPrice() {
    const price = tokenService.getUSDTokenPrice(mintAddress)
    const totalPrice = amount * price
    const totalPriceFormatted = amount
      ? new BigNumber(totalPrice).toFormat(0)
      : ''
    setTotalPrice(totalPriceFormatted)
  }
  function handleGoBackToMainView() {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }

  useEffect(() => {
    handleSetTotalPrice()
  }, [currentAccount])
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          {currentAccount?.token?.publicKey &&
          getAccountName(currentAccount?.token?.publicKey) ? (
            <div className="text-sm text-th-fgd-1">
              {getAccountName(currentAccount.token?.publicKey)}
            </div>
          ) : (
            <div className="text-xs text-th-fgd-1">
              {abbreviateAddress(accountPublicKey as PublicKey)}
            </div>
          )}
        </>
      </h3>
      <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full flex items-center">
        {tokenInfo?.logoURI && (
          <img
            className="flex-shrink-0 h-6 w-6 mr-2.5"
            src={tokenInfo.logoURI}
          />
        )}
        <div>
          <p className="text-fgd-3 text-xs">
            {amountFormatted} {tokenInfo?.symbol}
          </p>
          <h3 className="mb-0">
            {totalPrice && totalPrice !== '0' ? <>${totalPrice}</> : ''}
          </h3>
        </div>
      </div>
      <div className="flex justify-center">
        <Button onClick={() => setCurrentCompactView(ViewState.Send)}>
          Send
        </Button>
      </div>
    </>
  )
}

export default AccountOverview
