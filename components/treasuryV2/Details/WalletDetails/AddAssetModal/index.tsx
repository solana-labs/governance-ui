import React from 'react'
import cx from 'classnames'

import { Wallet } from '@models/treasury/Wallet'
import Button from '@components/Button'
import Modal from '@components/Modal'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import WalletQRCode from '@components/WalletQRCode'
import Address from '@components/Address'

interface TokenAccount {
  iconUrl?: string
  isATA?: boolean
  name: string
  tokenAccountAddress: string
  tokenMintAddress?: string
  walletAddress?: string
}

function isWallet(wallet: Wallet | TokenAccount): wallet is Wallet {
  return 'rules' in wallet
}

function getDepositAddress(wallet: Wallet | TokenAccount) {
  if (isWallet(wallet)) {
    return wallet.address
  }

  if (wallet.isATA && wallet.walletAddress) {
    return wallet.walletAddress
  }

  return wallet.tokenAccountAddress
}

interface Props {
  wallet: Wallet | TokenAccount
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
    <Modal
      isOpen
      sizeClassName={isWallet(props.wallet) ? 'w-[580px]' : 'w-fit'}
      onClose={props.onClose}
    >
      <h2 className="text-fgd-1 mb-8 text-center">
        {isWallet(props.wallet)
          ? 'Add an asset'
          : `Deposit ${props.wallet.name}`}
      </h2>
      <div
        className={cx(
          'gap-x-8',
          'grid',
          'justify-center',
          isWallet(props.wallet) && 'grid-cols-[repeat(3,max-content)]'
        )}
      >
        <div className="flex flex-col items-center space-y-2">
          {isWallet(props.wallet) && (
            <div className="text-sm text-white/50">Deposit Tokens</div>
          )}
          <WalletQRCode
            className="h-48 w-48"
            logoSrc={
              isWallet(props.wallet) ? realmInfo?.ogImage : props.wallet.iconUrl
            }
            walletAddress={getDepositAddress(props.wallet)}
            tokenMintAddress={
              isWallet(props.wallet) ? undefined : props.wallet.tokenMintAddress
            }
          />
          <Address
            address={getDepositAddress(props.wallet)}
            className="text-xs"
          />
          {!isWallet(props.wallet) && !props.wallet.isATA && (
            <div className="pt-4 text-xs text-white/50 max-w-[200px] text-center">
              Note: This address can only be used to deposit {props.wallet.name}
            </div>
          )}
        </div>
        {isWallet(props.wallet) && (
          <div className="flex items-center justify-center">
            <div className="text-lg text-fgd-1">OR</div>
          </div>
        )}
        {isWallet(props.wallet) && (
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
              Add Token Account
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
