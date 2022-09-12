import { useState } from 'react'
import { abbreviateAddress } from '@utils/formatting'

import Header from '@components/Header'
import Button from '@components/Button'
import NFTCollectionSelector from '@components/NewRealmWizard/components/NFTCollectionSelector'
import { WalletIcon } from './steps/AddNFTCollectionForm'
import Modal from '@components/Modal'

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
    show && (
      <Modal isOpen={show} onClose={onClose} sizeClassName="sm:max-w-2xl">
        <div className="flex flex-col items-center py-4 mb-2 space-x-4 text-center">
          <Header as="h4" className="text-fgd-1">
            Choose a collection from your wallet
          </Header>
          <Header
            as="cta"
            className="flex items-center justify-center mt-1 space-x-1 text-fgd-2"
          >
            <WalletIcon />
            <div>{walletPk && abbreviateAddress(walletPk)}</div>
          </Header>
        </div>
        <NFTCollectionSelector
          collections={collections}
          onChange={setSelected}
          value={selected}
        />
        <div className="float-right mt-2">
          <Button onClick={handleChoose} disabled={!selected}>
            Choose
          </Button>
        </div>
      </Modal>
    )
  )
}
