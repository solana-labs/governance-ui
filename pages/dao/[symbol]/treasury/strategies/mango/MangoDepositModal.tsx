import Modal from '@components/Modal'
import tokenService from '@utils/services/token'
import ModalHeader from '../../components/ModalHeader'
import ModalLeftSide from '../../components/ModalLeftSide'
import ModalRightSide from '../../components/ModalRightSide'
import MangoDeposit from './MangoDeposit'
import { MANGO_MINT } from './MangoItem'

const MangoDepositModal = ({ onClose, isOpen }) => {
  const info = tokenService.getTokenInfo(MANGO_MINT)
  const strategy = 'Deposit'
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
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
