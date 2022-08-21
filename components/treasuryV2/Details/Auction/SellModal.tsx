import Modal from '@components/Modal'
import { Token, Sol } from '@models/treasury/Asset'
import Sell from './Sell'
//import { createAuctionInstructions } from 'auction-house/sdk/auction'

interface Props {
  isOpen: boolean
  asset: Token | Sol
  onClose: () => void
}

export default function SellModal({ onClose, isOpen, asset }: Props) {
  return isOpen ? (
    <Modal sizeClassName="max-w-4xl" onClose={onClose} isOpen={isOpen}>
      <>
        <h3 className="mb-4 flex items-center">Create token sale auction</h3>
        <Sell asset={asset}></Sell>
      </>
    </Modal>
  ) : null
}
