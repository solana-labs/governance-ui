import React from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import AccountLabel from './AccountHeader'
import DepositLabel from './DepositLabel'

const DepositTokens = () => {
  const { setCurrentCompactView } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={() => setCurrentCompactView(ViewState.AccountView)}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          Deposit {tokenInfo && tokenInfo?.symbol}
        </>
      </h3>
      <AccountLabel></AccountLabel>
      <DepositLabel
        transferAddress={currentAccount?.transferAddress}
      ></DepositLabel>
    </>
  )
}

export default DepositTokens
