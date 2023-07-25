import { useState } from 'react'
import cx from 'classnames'
import { ReplyIcon } from '@heroicons/react/outline'

import { SecondaryButton } from '@components/Button'
import Modal from '@components/Modal'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Address from '@components/Address'

import SendNft from '@components/SendNft'
import { PublicKey } from '@solana/web3.js'
import { useDigitalAssetById } from '@hooks/queries/digitalAssets'
import NFTCollectionPreviewIcon from '@components/treasuryV2/icons/NFTCollectionPreviewIcon'

interface Props {
  collectionId: PublicKey | 'none'
  governance: PublicKey
}

export default function Header({ collectionId, governance }: Props) {
  const [sendNFTsModalOpen, setSendNFTsModalOpen] = useState(false)
  const { canUseTransferInstruction } = useGovernanceAssets()

  const { data: collectionNft } = useDigitalAssetById(
    collectionId !== 'none' ? collectionId : undefined
  )
  const name = collectionNft?.result.content.metadata.name
  const imageUri =
    collectionNft?.result.content.files[0]?.cdn_uri ??
    collectionNft?.result.content.files[0]?.uri

  return (
    <div
      className={cx(
        'bg-bkg-1',
        'gap-x-4',
        'grid-cols-[1fr_max-content]',
        'grid',
        'min-h-[128px]',
        'px-8',
        'py-4'
      )}
    >
      <div className={cx('grid', 'items-center')}>
        <div>
          <div className="grid items-center grid-cols-[40px_1fr] gap-x-4">
            {collectionId === 'none' ? (
              <NFTCollectionPreviewIcon className="stroke-fgd-1 h-10 w-10" />
            ) : (
              <img src={imageUri} className="h-10 w-10 rounded stroke-fgd-1" />
            )}

            <div className="overflow-hidden">
              {name && (
                <div className="text-white/50 text-sm">NFT Collection</div>
              )}
              <div className="text-fgd-1 font-bold text-2xl whitespace-nowrap text-ellipsis overflow-hidden">
                {collectionId !== 'none' ? name : 'NFTs with no collection'}
              </div>
            </div>
          </div>
          {collectionId !== 'none' && (
            <Address address={collectionId} className="ml-14 text-xs" />
          )}
        </div>
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
          <SendNft initialNftAndGovernanceSelected={[undefined, governance]} />
        </Modal>
      )}
    </div>
  )
}
