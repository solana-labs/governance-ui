import Modal from '@components/Modal'
import tokenService from '@utils/services/token'
import ModalHeader from '../../ModalHeader'
import ModalLeftSide from '../../ModalLeftSide'
import ModalRightSide from '../../ModalRightSide'
import MangoDeposit from './MangoDeposit'
import { MANGO_MINT } from './MangoItem'

const MangoDepositModal = ({ onClose, isOpen }) => {
  const info = tokenService.getTokenInfo(MANGO_MINT)
  const strategy = 'Deposit'
  return (
    <Modal sizeClassName="max-w-4xl" onClose={onClose} isOpen={isOpen}>
      <ModalHeader
        logoURI={info?.logoURI}
        protocolName={info?.name}
        strategy={strategy}
      ></ModalHeader>
      <div className="flex flex-items">
        <ModalLeftSide strategy={strategy} liquidity={0} projectedYield={0}>
          <div>Lorem ipsum</div>
        </ModalLeftSide>
        <ModalRightSide>
          <MangoDeposit></MangoDeposit>
        </ModalRightSide>
      </div>
    </Modal>
  )
}

export default MangoDepositModal
