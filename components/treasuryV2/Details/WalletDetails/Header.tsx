import React, { useState } from 'react'
import cx from 'classnames'
import {
  PlusCircleIcon,
  DocumentDuplicateIcon,
  // ReplyIcon,
} from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'

import { abbreviateAddress } from '@utils/formatting'
import { formatNumber } from '@utils/formatNumber'
import { NEW_PROGRAM_VIEW } from 'pages/dao/[symbol]/assets'
import { Wallet } from '@models/treasury/Wallet'
import Button, { SecondaryButton } from '@components/Button'
import DepositNFT from '@components/TreasuryAccount/DepositNFTFromWallet'
import Modal from '@components/Modal'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import CreateAta from '@components/TreasuryAccount/CreateAta'

import AddAssetModal from './AddAssetModal'
import WalletIcon from '../../icons/WalletIcon'

enum ModalType {
  AddAsset,
  DepositNFTs,
  NewTokenAccount,
  None,
}

interface Props {
  className?: string
  wallet: Wallet
}

export default function Header(props: Props) {
  const [openModal, setOpenModal] = useState<ModalType>(ModalType.None)
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = useRealm()
  const router = useRouter()

  return (
    <div
      className={cx(
        props.className,
        'bg-black',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'flex',
        'items-center',
        'justify-between'
      )}
    >
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20">
            <WalletIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-white/50 text-sm">DAO Wallet</div>
            <div className="text-fgd-1 font-bold text-2xl">
              ${formatNumber(props.wallet.totalValue)}
            </div>
          </div>
        </div>
        <button
          className={cx(
            'cursor-pointer',
            'flex',
            'items-center',
            'ml-12',
            'space-x-2',
            'text-white/50',
            'text-xs',
            'transition-colors',
            'hover:text-fgd-1'
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
          <DocumentDuplicateIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col space-y-2">
        <Button
          className="w-48"
          onClick={() => setOpenModal(ModalType.AddAsset)}
        >
          <div className="flex items-center justify-center">
            <PlusCircleIcon className="h-4 w-4 mr-1 scale-x-[-1]" />
            Add
          </div>
        </Button>
        {/* <SecondaryButton className="w-48 mt-8">
          <div className="flex items-center justify-center">
            <ReplyIcon className="h-4 w-4 mr-1 scale-x-[-1]" />
            Send
          </div>
        </SecondaryButton> */}
      </div>
      {openModal === ModalType.AddAsset && (
        <AddAssetModal
          wallet={props.wallet}
          onAddProgramSelected={() =>
            router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_PROGRAM_VIEW}`))
          }
          onAddTokenAccount={() => setOpenModal(ModalType.NewTokenAccount)}
          onClose={() => setOpenModal(ModalType.None)}
          onDepositNFTsSelected={() => {
            setOpenModal(ModalType.DepositNFTs)
          }}
        />
      )}
      {openModal === ModalType.DepositNFTs && (
        <Modal
          isOpen
          sizeClassName="sm:max-w-3xl"
          onClose={() => setOpenModal(ModalType.None)}
        >
          <DepositNFT
            additionalBtns={
              <SecondaryButton onClick={() => setOpenModal(ModalType.None)}>
                Close
              </SecondaryButton>
            }
          />
        </Modal>
      )}
      {openModal === ModalType.NewTokenAccount &&
        props.wallet.governanceAccount && (
          <Modal
            isOpen
            sizeClassName="sm:max-w-3xl"
            onClose={() => setOpenModal(ModalType.None)}
          >
            <CreateAta
              createCallback={() => setOpenModal(ModalType.None)}
              owner={new PublicKey(props.wallet.address)}
              governancePk={props.wallet.governanceAccount.pubkey}
            />
          </Modal>
        )}
    </div>
  )
}
