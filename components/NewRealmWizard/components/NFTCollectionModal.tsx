import { abbreviateAddress } from '@utils/formatting'

import Header from '@components/Header'
import { NewButton as Button } from '@components/Button'
import NFTCollectionSelector from '@components/NewRealmWizard/components/NFTCollectionSelector'
import { WalletIcon } from './steps/AddNFTCollectionForm'
import { ConfirmationDialog } from '@components/Modal'

export default function NFTCollectionModal({
  show,
  walletPk,
  collections,
  metadata,
  selectedNFTCollection,
  onClose,
  onSelect,
}) {
  function handleClose() {
    onSelect('')
    onClose()
  }

  return (
    <ConfirmationDialog
      isOpen={show}
      onClose={onClose}
      header={
        <div className="flex flex-col items-center mb-2 space-x-4 text-center">
          <Header as="h2">Choose a collection for you DAO</Header>
          <Header
            as="h4"
            className="flex items-center justify-center space-x-4 text-white/50"
          >
            <WalletIcon />
            {walletPk && abbreviateAddress(walletPk)}
          </Header>
        </div>
      }
      confirmButton={
        <Button
          type="button"
          onClick={onClose}
          disabled={!selectedNFTCollection}
          className="w-full md:w-fit md:ml-4"
        >
          Choose
        </Button>
      }
      closeButton={
        <Button
          type="button"
          secondary
          onClick={handleClose}
          className="w-full md:w-fit"
        >
          {selectedNFTCollection ? 'Cancel' : 'Close'}
        </Button>
      }
    >
      <NFTCollectionSelector
        collections={collections}
        metadata={metadata}
        onChange={onSelect}
        value={selectedNFTCollection}
      />
    </ConfirmationDialog>
  )
}
