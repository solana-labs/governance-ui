import React, { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Button, { SecondaryButton } from '@components/Button'
import Tooltip from '@components/Tooltip'
import DepositNFTFromWallet from './DepositNFTFromWallet'
import DepositNFTAddress from './DepositNFTAddress'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/solid'
import { getExplorerUrl } from '@components/explorer/tools'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

enum DepositState {
  DepositNFTFromWallet,
  DepositNFTAddress,
}

const DepositNFT = ({ onClose }) => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const [
    currentDepositView,
    setCurrentDepositView,
  ] = useState<DepositState | null>(null)

  return (
    <>
      <h3 className="mb-4 flex items-center">
        {currentDepositView !== null && (
          <ArrowLeftIcon
            className="h-4 w-4 mr-1 text-primary-light cursor-pointer"
            onClick={() => setCurrentDepositView(null)}
          />
        )}
        Deposit NFT
        <a
          href={
            currentAccount?.governance?.pubkey
              ? getExplorerUrl(
                  connection.cluster,
                  currentAccount!.governance!.pubkey.toBase58()
                )
              : ''
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
        </a>
      </h3>
      {currentDepositView === null && (
        <div className="space-y-4 pb-4 flex flex-col items-center justify-center">
          <Button
            className="w-96"
            disabled={!connected}
            onClick={() =>
              setCurrentDepositView(DepositState.DepositNFTFromWallet)
            }
          >
            <Tooltip content={!connected && 'Please connect your wallet'}>
              <div>Deposit NFT from my wallet</div>
            </Tooltip>
          </Button>
          <Button
            className="w-96"
            onClick={() =>
              setCurrentDepositView(DepositState.DepositNFTAddress)
            }
          >
            <div>Deposit NFT to Treasury account address</div>
          </Button>
        </div>
      )}
      {currentDepositView === DepositState.DepositNFTFromWallet && (
        <DepositNFTFromWallet></DepositNFTFromWallet>
      )}
      {currentDepositView === DepositState.DepositNFTAddress && (
        <DepositNFTAddress
          additionalBtns={
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
          }
        ></DepositNFTAddress>
      )}
    </>
  )
}

export default DepositNFT
