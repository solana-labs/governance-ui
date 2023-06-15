import React, { useState } from 'react'
import cx from 'classnames'
import { ReplyIcon } from '@heroicons/react/outline'

import { formatNumber } from '@utils/formatNumber'
import { NFTCollection } from '@models/treasury/Asset'
import { SecondaryButton } from '@components/Button'
import Modal from '@components/Modal'
import SendTokens from '@components/TreasuryAccount/SendTokens'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import Address from '@components/Address'

import NFTCollectionPreviewIcon from '../../icons/NFTCollectionPreviewIcon'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

interface Props {
  className?: string
  nftCollection: NFTCollection
}

export default function Header(props: Props) {
  const [sendNFTsModalOpen, setSendNFTsModalOpen] = useState(false)
  const {
    canUseTransferInstruction,
    nftsGovernedTokenAccounts,
  } = useGovernanceAssets()
  const { setCurrentAccount } = useTreasuryAccountStore()
  const connection = useLegacyConnectionContext()

  const hasCount = !!props.nftCollection.totalCount

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'gap-x-4',
        'grid-cols-[1fr_max-content]',
        'grid',
        'min-h-[128px]',
        'px-8',
        'py-4'
      )}
    >
      <div
        className={cx(
          'grid',
          'items-center',
          hasCount && 'gap-4',
          hasCount && 'grid-cols-[repeat(auto-fill,minmax(275px,1fr))]'
        )}
      >
        <div>
          <div className="grid items-center grid-cols-[40px_1fr] gap-x-4">
            {React.cloneElement(props.nftCollection.icon, {
              className: cx(
                props.nftCollection.icon.props.classname,
                'h-10',
                'stroke-fgd-1',
                'rounded',
                'w-10'
              ),
            })}
            <div className="overflow-hidden">
              {props.nftCollection.name && (
                <div className="text-white/50 text-sm">NFT Collection</div>
              )}
              <div className="text-fgd-1 font-bold text-2xl whitespace-nowrap text-ellipsis overflow-hidden">
                {props.nftCollection.name || 'NFTs without a collection'}
              </div>
            </div>
          </div>
          {props.nftCollection.address && (
            <Address
              address={props.nftCollection.address}
              className="ml-14 text-xs"
            />
          )}
        </div>
        {props.nftCollection.totalCount && (
          <div className="pl-14">
            <div className="text-sm text-white/50 flex items-center space-x-1">
              <NFTCollectionPreviewIcon className="h-4 w-4 fill-white/50" />
              <div>NFTs in Collection</div>
            </div>
            <div className="text-xl text-fgd-1 font-bold">
              {formatNumber(props.nftCollection.totalCount, undefined, {})}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center space-y-2 max-h-[128px] justify-center">
        <SecondaryButton
          className="w-48"
          disabled={!canUseTransferInstruction}
          tooltipMessage={
            !canUseTransferInstruction
              ? 'You need to have connected wallet with ability to create token transfer proposals'
              : undefined
          }
          onClick={() => {
            setCurrentAccount(nftsGovernedTokenAccounts[0], connection)
            setSendNFTsModalOpen(true)
          }}
        >
          <div className="flex items-center justify-center">
            <ReplyIcon className="h-4 w-4 mr-1 scale-x-[-1]" />
            Send
          </div>
        </SecondaryButton>
      </div>
      {sendNFTsModalOpen && (
        <Modal
          isOpen
          sizeClassName="sm:max-w-3xl"
          onClose={() => setSendNFTsModalOpen(false)}
        >
          <SendTokens isNft />
        </Modal>
      )}
    </div>
  )
}
