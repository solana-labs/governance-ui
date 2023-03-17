import Modal from '@components/Modal'
//import { Token } from '@models/treasury/Asset'
import Sell from './Sell'
//import { createAuctionInstructions } from 'auction-house/sdk/auction'

interface Props {
  isOpen: boolean
  //asset: Token
  onClose: () => void
}

export default function SellModal({ onClose, isOpen }: Props) {
  return isOpen ? (
    <Modal onClose={onClose} isOpen={isOpen}>
      <>
        <h3 className="mb-4 flex items-center">Sell tokens</h3>
        <Sell></Sell>
      </>
    </Modal>
  ) : null
}
