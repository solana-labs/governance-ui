import Modal from '@components/Modal'
import { Token } from '@models/treasury/Asset'
import Buy from './Buy'
//import { createAuctionInstructions } from 'auction-house/sdk/auction'

interface Props {
  isOpen: boolean
  asset: Token
  onClose: () => void
}

export default function BuyModal({ onClose, isOpen, asset }: Props) {
  return isOpen ? (
    <Modal onClose={onClose} isOpen={isOpen}>
      <>
        <h3 className="mb-4 flex items-center">Buy tokens</h3>
        <Buy asset={asset}></Buy>
      </>
    </Modal>
  ) : null
}
