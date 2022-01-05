import React, { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import DepositNFTFromWallet from './DepositNFTFromWallet'
import DepositNFTAddress from './DepositNFTAddress'

enum DepositState {
  DepositNFTFromWallet,
  DepositNFTAddress,
}

const DepositNFT = () => {
  const connected = useWalletStore((s) => s.connected)
  const [
    currentDepositView,
    setCurrentDepositView,
  ] = useState<DepositState | null>(null)
  console.log(currentDepositView)
  return (
    <>
      <h3 className="mb-4 flex items-center">Deposit NFT</h3>
      {currentDepositView === null && (
        <div className="space-y-4 w-full pb-4">
          <Button
            disabled={!connected}
            className="sm:w-full"
            onClick={() =>
              setCurrentDepositView(DepositState.DepositNFTFromWallet)
            }
          >
            <Tooltip content={!connected && 'Please connect your wallet'}>
              <div>I want to deposit NFT straight from my wallet</div>
            </Tooltip>
          </Button>
          <Button
            className="sm:w-full"
            onClick={() =>
              setCurrentDepositView(DepositState.DepositNFTAddress)
            }
          >
            <div>I want to get address</div>
          </Button>
        </div>
      )}
      {currentDepositView === DepositState.DepositNFTFromWallet && (
        <DepositNFTFromWallet></DepositNFTFromWallet>
      )}
      {currentDepositView === DepositState.DepositNFTAddress && (
        <DepositNFTAddress></DepositNFTAddress>
      )}
    </>
  )
}

export default DepositNFT
