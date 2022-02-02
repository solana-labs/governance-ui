import Modal from '@components/Modal'
import tokenService from '@utils/services/token'
import ModalLeftSide from '../../components/ModalLeftSide'
import { MANGO_MINT } from './MangoItem'

const MangoDepositModal = ({ onClose, isOpen }) => {
  const info = tokenService.getTokenInfo(MANGO_MINT)
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="flex flex-items">
        <ModalLeftSide
          logoSrc={info?.logoURI}
          strategy="Deposit"
          protocol={info?.name}
          liquidity={0}
          projectedYield={0}
        >
          <div>Lorem ipsum</div>
        </ModalLeftSide>
        <div>DEPOSIT</div>
      </div>
    </Modal>
  )
}

export default MangoDepositModal
