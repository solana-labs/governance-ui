import React, { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import DepositNFTFromWallet from './DepositNFTFromWallet'
import DepositNFTAddress from './DepositNFTAddress'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { abbreviateAddress } from '@utils/formatting'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import AccountItemNFT from './AccountItemNFT'

enum DepositState {
  DepositNFTFromWallet,
  DepositNFTAddress,
}

const DepositNFT = () => {
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const [
    currentDepositView,
    setCurrentDepositView,
  ] = useState<DepositState | null>(null)
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const { setCurrentCompactAccount } = useTreasuryAccountStore()
  return (
    <>
      <h3 className="mb-4 flex items-center">
        Deposit NFT:{' '}
        {currentAccount
          ? abbreviateAddress(currentAccount!.governance!.pubkey)
          : ''}
      </h3>
      {currentDepositView === null && (
        <div className="space-y-4 pb-4 flex flex-col items-center justify-center">
          <div className="flex flex-row">
            {nftsGovernedTokenAccounts.map((accountWithGovernance) => (
              <AccountItemNFT
                onClick={() => {
                  setCurrentCompactAccount(accountWithGovernance, connection)
                }}
                className={`mr-2 ${
                  currentAccount?.governance?.pubkey.toBase58() ===
                  accountWithGovernance.governance?.pubkey.toBase58()
                    ? 'border-primary-dark'
                    : ''
                }`}
                governedAccountTokenAccount={accountWithGovernance}
                key={accountWithGovernance?.governance?.pubkey.toBase58()}
              />
            ))}
          </div>

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
        <DepositNFTAddress></DepositNFTAddress>
      )}
    </>
  )
}

export default DepositNFT
