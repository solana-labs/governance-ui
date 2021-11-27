import Button from '@components/Button'
import { getExplorerUrlForTxSign } from '@components/explorer/tools'
import { getAccountName } from '@components/instructions/tools'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { ConfirmedSignatureInfo, PublicKey } from '@solana/web3.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import { abbreviateAddress, fmtUnixTime } from '@utils/formatting'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import { ViewState } from './Types'

const AccountOverview = () => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const connection = useWalletStore((s) => s.connection)
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  const mintAddress = useTreasuryAccountStore((s) => s.compact.mintAddress)

  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useTreasuryAccountStore()
  const [totalPrice, setTotalPrice] = useState('')
  const [recentActivity, setRecentActivity] = useState<
    ConfirmedSignatureInfo[]
  >([])
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
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const handleGetAccountHistory = async () => {
    const resp = await connection.current.getConfirmedSignaturesForAddress2(
      currentAccount!.governance!.info.governedAccount,
      {
        limit: 6,
      },
      //TODO confirmed ?
      'confirmed'
    )
    setRecentActivity(resp)
  }
  useEffect(() => {
    handleSetTotalPrice()
    if (currentAccount) {
      handleGetAccountHistory()
    }
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
      <div className="flex justify-center mb-4">
        <Button
          className="lg:w-1/2"
          onClick={() => setCurrentCompactView(ViewState.Send)}
        >
          Send
        </Button>
      </div>
      <div className="font-normal mr-1 text-xs text-fgd-3 mb-4">
        Recent activity
      </div>
      <div>
        {recentActivity.map((activity) => (
          <a
            href={
              activity.signature
                ? getExplorerUrlForTxSign(
                    connection.endpoint,
                    activity.signature
                  )
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3 css-1ug690d-StyledCardWrapepr elzt7lo0 p-4 text-xs text-th-fgd-1 mb-2 flex"
            key={activity.signature}
          >
            <div>{activity.signature.substring(0, 12)}...</div>
            <div className="ml-auto text-fgd-3 text-xs flex flex-col">
              {activity.blockTime
                ? fmtUnixTime(new BN(activity.blockTime))
                : null}
            </div>
          </a>
        ))}
      </div>
    </>
  )
}

export default AccountOverview
