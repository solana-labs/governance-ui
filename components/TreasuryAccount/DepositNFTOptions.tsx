import React from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'

const DepositNFT = () => {
  const { setCurrentCompactView } = useTreasuryAccountStore()
  const connected = useWalletStore((s) => s.connected)
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={() => setCurrentCompactView(ViewState.AccountView)}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          Deposit
        </>
      </h3>
      <div className="space-y-4 w-full pb-4">
        <Button
          disabled={!connected}
          className="sm:w-full"
          onClick={() => setCurrentCompactView(ViewState.DepositNFTFromWallet)}
        >
          <Tooltip content={!connected && 'Please connect your wallet'}>
            <div>I want to deposit NFTS straight from my wallet</div>
          </Tooltip>
        </Button>
        <Button
          className="sm:w-full"
          onClick={() => setCurrentCompactView(ViewState.DepositNFT)}
        >
          <div>I want to get address</div>
        </Button>
      </div>
    </>
  )
}

export default DepositNFT
