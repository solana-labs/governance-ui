import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { PlusCircleIcon, ReplyIcon } from '@heroicons/react/outline'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token as SplToken,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { AssetType, Token, Sol } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'
import { SecondaryButton } from '@components/Button'
import Modal from '@components/Modal'
import SendTokens from '@components/TreasuryAccount/SendTokens'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import Address from '@components/Address'

import AddAssetModal from '../WalletDetails/AddAssetModal'

interface Props {
  className?: string
  asset: Token | Sol
  wallet?: Wallet
}

export default function Header(props: Props) {
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [depositAssetModalOpen, setDepositAssetModalOpen] = useState(false)
  const [isATA, setIsATA] = useState(false)
  const setCurrentAccount = useTreasuryAccountStore((s) => s.setCurrentAccount)
  const connection = useWalletStore((s) => s.connection)
  const { canUseTransferInstruction } = useGovernanceAssets()

  useEffect(() => {
    if (props.asset.type === AssetType.Sol) {
      setIsATA(true)
    } else if (props.wallet) {
      const mint = props.asset.raw.extensions.mint?.publicKey

      if (mint) {
        SplToken.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          new PublicKey(props.wallet.address),
          true
        ).then((ata) => {
          setIsATA(ata.toBase58() === props.asset.address)
        })
      }
    }
  }, [props.asset, props.wallet])

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'gap-x-4',
        'grid',
        'grid-cols-[1fr_max-content]',
        'items-center'
      )}
    >
      <div className="overflow-hidden">
        <div className="grid items-center grid-cols-[40px_1fr] gap-x-4">
          {props.asset.type === AssetType.Sol ? (
            <img
              className="h-10 w-10 rounded-full"
              src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
            />
          ) : (
            React.cloneElement(props.asset.icon, {
              className: cx(
                props.asset.icon.props.className,
                'h-10',
                'rounded-full',
                'w-10'
              ),
            })
          )}
          <div className="overflow-hidden">
            <div
              className={cx(
                'overflow-hidden',
                'text-ellipsis',
                'text-sm',
                'text-white/50',
                'whitespace-nowrap'
              )}
            >
              {props.asset.type === AssetType.Sol ? 'SOL' : props.asset.name}
            </div>
            <div
              className={cx(
                'align-baseline',
                'font-bold',
                'overflow-hidden',
                'text-2xl',
                'text-ellipsis',
                'text-fgd-1',
                'whitespace-nowrap'
              )}
              title={
                formatNumber(props.asset.count) +
                ' ' +
                (props.asset.type === AssetType.Sol
                  ? 'SOL'
                  : props.asset.symbol)
              }
            >
              {formatNumber(props.asset.count)}
              <span className="text-sm ml-1">
                {props.asset.type === AssetType.Sol
                  ? 'SOL'
                  : props.asset.symbol}
              </span>
            </div>
          </div>
        </div>
        <Address address={props.asset.address} className="ml-14 text-xs" />
      </div>
      <div className="flex flex-col space-y-2">
        {props.asset.raw.extensions.transferAddress ? (
          <SecondaryButton
            className="w-48"
            onClick={() => setDepositAssetModalOpen(true)}
          >
            <div className="flex items-center justify-center">
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              Deposit
            </div>
          </SecondaryButton>
        ) : (
          <div />
        )}
        {props.wallet && (
          <SecondaryButton
            className="w-48"
            disabled={!canUseTransferInstruction}
            tooltipMessage={
              !canUseTransferInstruction
                ? 'You need to have connected wallet with ability to create token transfer proposals'
                : undefined
            }
            onClick={() => {
              setCurrentAccount(props.asset.raw, connection)
              setSendModalOpen(true)
            }}
          >
            <div className="flex items-center justify-center">
              <ReplyIcon className="h-4 w-4 mr-1 scale-x-[-1]" />
              Send
            </div>
          </SecondaryButton>
        )}
      </div>
      {sendModalOpen && (
        <Modal
          isOpen
          sizeClassName="sm:max-w-3xl"
          onClose={() => setSendModalOpen(false)}
        >
          <SendTokens />
        </Modal>
      )}
      {depositAssetModalOpen && props.asset.raw.extensions.transferAddress && (
        <AddAssetModal
          wallet={{
            isATA,
            iconUrl:
              props.asset.type === AssetType.Sol
                ? 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
                : props.asset.logo,
            name:
              props.asset.type === AssetType.Sol ? 'SOL' : props.asset.symbol,
            tokenAccountAddress: props.asset.raw.extensions.transferAddress.toBase58(),
            tokenMintAddress:
              props.asset.type === AssetType.Sol
                ? undefined
                : props.asset.raw.extensions.mint?.publicKey.toBase58(),
            walletAddress: props.wallet?.address,
          }}
          onClose={() => setDepositAssetModalOpen(false)}
        />
      )}
    </div>
  )
}
