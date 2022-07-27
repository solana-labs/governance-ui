import React from 'react'
import cx from 'classnames'
import { DocumentDuplicateIcon } from '@heroicons/react/outline'

import { abbreviateAddress } from '@utils/formatting'
import { Wallet } from '@models/treasury/Wallet'
import Button from '@components/Button'
import Modal from '@components/Modal'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import WalletQRCode from '@components/WalletQRCode'

interface Props {
  wallet: Wallet
  onAddProgramSelected?(): void
  onAddTokenAccount?(): void
  onClose?(): void
  onDepositNFTsSelected?(): void
}

export default function AddAssetModal(props: Props) {
  const { ownVoterWeight, realmInfo, realm } = useRealm()
  const connected = useWalletStore((s) => s.connected)

  const tokenOwnerRecord = ownVoterWeight.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined

  return (
    <Modal isOpen sizeClassName="w-[580px]" onClose={props.onClose}>
      <h2 className="text-fgd-1 mb-8 text-center">Add an asset</h2>
      <div className="gap-x-8 grid grid-cols-[repeat(3,max-content)] justify-center">
        <div className="flex flex-col items-center space-y-2">
          <WalletQRCode
            className="h-48 w-48"
            logoSrc={realmInfo?.ogImage}
            walletAddress={props.wallet.address}
          />
          <button
            className={cx(
              'flex',
              'items-center',
              'space-x-1',
              'text-sm',
              'text-white/50',
              'transition-colors',
              'hover:text-white'
            )}
            onClick={async () => {
              try {
                await navigator?.clipboard?.writeText(props.wallet.address)
              } catch {
                console.error('Could not copy address to clipboard')
              }
            }}
          >
            <div>{abbreviateAddress(props.wallet.address)}</div>
            <DocumentDuplicateIcon className="h-4 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-lg text-fgd-1">OR</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-y-4">
          <Button
            className="w-48"
            disabled={!connected}
            tooltipMessage={
              !connected
                ? 'You must connect your wallet to deposit NFTs'
                : undefined
            }
            onClick={props.onDepositNFTsSelected}
          >
            Deposit NFTs
          </Button>
          <Button
            className="w-48"
            disabled={!connected || !tokenOwnerRecord}
            tooltipMessage={
              !connected
                ? 'You must connect your wallet to propose adding a program'
                : !tokenOwnerRecord
                ? "You don't have the ability to add a new program"
                : undefined
            }
            onClick={props.onAddProgramSelected}
          >
            Add a Program
          </Button>
          <Button
            className="w-48"
            disabled={!connected || !props.wallet.governanceAccount}
            tooltipMessage={
              !props.wallet.governanceAccount
                ? "It's not possible to add a new token account to this wallet"
                : !connected
                ? 'You must connect your wallet to add a new token account'
                : undefined
            }
            onClick={props.onAddTokenAccount}
          >
            Create Token Account
          </Button>
        </div>
      </div>
    </Modal>
  )
}
