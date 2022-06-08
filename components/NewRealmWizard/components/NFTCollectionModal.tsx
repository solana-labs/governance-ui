import { useState } from 'react'
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
  onClose,
  onSelect,
}) {
  const [selected, setSelected] = useState('')

  function close() {
    onClose()
    setSelected('')
  }

  function handleChoose() {
    onSelect({ key: selected, collection: collections[selected] })
    close()
  }

  return (
    <ConfirmationDialog
      isOpen={show}
      onClose={onClose}
      header={
        <div className="flex flex-col items-center mb-2 space-x-4 text-center">
          <Header as="h4">Choose a collection for you DAO</Header>
          <Header
            as="h6"
            className="flex items-center justify-center space-x-4 text-white/50"
          >
            <WalletIcon />
            {walletPk && abbreviateAddress(walletPk)}
          </Header>
        </div>
      }
      confirmButton={
        <Button type="button" onClick={handleChoose} disabled={!selected}>
          Choose
        </Button>
      }
      closeButton={
        <Button type="button" secondary onClick={close}>
          {selected ? 'Cancel' : 'Close'}
        </Button>
      }
    >
      <NFTCollectionSelector
        collections={collections}
        onChange={setSelected}
        value={selected}
      />
    </ConfirmationDialog>
  )
}
