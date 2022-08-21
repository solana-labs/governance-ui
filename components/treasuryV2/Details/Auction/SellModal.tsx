import Modal from '@components/Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function SellModal({ onClose, isOpen }: Props) {
  return isOpen ? (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div>asdas</div>
    </Modal>
  ) : null
}
