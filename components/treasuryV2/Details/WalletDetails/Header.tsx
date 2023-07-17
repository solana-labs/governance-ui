import { useState } from 'react'
import cx from 'classnames'
import { PlusCircleIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'

import { formatNumber } from '@utils/formatNumber'
import { NEW_PROGRAM_VIEW } from 'pages/dao/[symbol]/assets'
import { Wallet } from '@models/treasury/Wallet'
import { SecondaryButton } from '@components/Button'
import DepositNFTFromWallet from '@components/TreasuryAccount/DepositNFTFromWallet'
import Modal from '@components/Modal'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import CreateAta from '@components/TreasuryAccount/CreateAta'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import Address from '@components/Address'

import AddAssetModal from './AddAssetModal'
import SelectedWalletIcon from '../../icons/SelectedWalletIcon'
import { AssetAccount, AccountType } from '@utils/uiTypes/assets'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

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
  const { assetAccounts, nftsGovernedTokenAccounts } = useGovernanceAssets()
  const { setCurrentAccount } = useTreasuryAccountStore()
  const { symbol } = useRealm()
  const connection = useLegacyConnectionContext()
  const router = useRouter()

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'flex',
        'items-center',
        'justify-between'
      )}
    >
      <div>
        <div className="flex items-center space-x-4">
          <SelectedWalletIcon className="h-10 w-10" />
          <div>
            <div className="text-white/50 text-sm">
              {props.wallet.name || 'DAO Wallet'}
            </div>
            <div className="text-fgd-1 font-bold text-2xl">
              ${formatNumber(props.wallet.totalValue)}
            </div>
          </div>
        </div>
        <Address address={props.wallet.address} className="ml-14 text-xs" />
      </div>
      <div className="flex flex-col space-y-2">
        <SecondaryButton
          className="w-48"
          onClick={() => setOpenModal(ModalType.AddAsset)}
        >
          <div className="flex items-center justify-center">
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add Asset
          </div>
        </SecondaryButton>
      </div>
      {openModal === ModalType.AddAsset && (
        <AddAssetModal
          wallet={props.wallet}
          onAddProgramSelected={() =>
            router.push(
              fmtUrlWithCluster(
                `/dao/${symbol}${NEW_PROGRAM_VIEW}?wallet=${props.wallet.address}`
              )
            )
          }
          onAddTokenAccount={() => setOpenModal(ModalType.NewTokenAccount)}
          onClose={() => setOpenModal(ModalType.None)}
          onDepositNFTsSelected={async () => {
            let account: AssetAccount | undefined

            for (const acc of assetAccounts) {
              if (acc.pubkey.toBase58() === props.wallet.address) {
                account = acc
                break
              } else if (
                (acc.type === AccountType.TOKEN ||
                  acc.type === AccountType.NFT) &&
                acc.extensions?.transferAddress?.toBase58() ===
                  props.wallet.address
              ) {
                account = acc
                break
              }
            }

            if (account) {
              setCurrentAccount(account, connection)
            } else if (nftsGovernedTokenAccounts[0]) {
              setCurrentAccount(nftsGovernedTokenAccounts[0], connection)
            }

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
          <DepositNFTFromWallet
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
