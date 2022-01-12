import React, { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Button, { SecondaryButton } from '@components/Button'
import Tooltip from '@components/Tooltip'
import DepositNFTFromWallet from './DepositNFTFromWallet'
import DepositNFTAddress from './DepositNFTAddress'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { abbreviateAddress } from '@utils/formatting'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/solid'
import { getExplorerUrl } from '@components/explorer/tools'

enum DepositState {
  DepositNFTFromWallet,
  DepositNFTAddress,
}

const DepositNFT = ({ onClose }) => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
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
        Deposit NFT to
        {currentAccount
          ? abbreviateAddress(currentAccount!.governance!.pubkey)
          : ''}
        <a
          href={
            currentAccount?.governance?.pubkey
              ? getExplorerUrl(
                  connection.endpoint,
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
