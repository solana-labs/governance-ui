import Modal from '@components/Modal'
import tokenService from '@utils/services/token'
import ModalHeader from '../../components/ModalHeader'
import ModalLeftSide from '../../components/ModalLeftSide'
import ModalRightSide from '../../components/ModalRightSide'
import MangoDeposit from './MangoDeposit'
import { MANGO_MINT } from './tools'

const MangoDepositModal = ({
  onClose,
  isOpen,
  mint,
  liquidity,
  projectedYield,
}) => {
  const info = tokenService.getTokenInfo(mint)
  const mangoInfo = tokenService.getTokenInfo(MANGO_MINT)
  const strategy = 'Deposit'
  return (
    <Modal sizeClassName="max-w-7xl" onClose={onClose} isOpen={isOpen}>
      <ModalHeader
        protocolLogoURI={mangoInfo?.logoURI}
        protocolName={'Mango'}
        TokenName={info?.name}
        strategy={strategy}
      ></ModalHeader>
      <div className="flex flex-items">
        <ModalLeftSide
          strategy={strategy}
          liquidity={liquidity}
          projectedYield={projectedYield}
        >
          <div>DESCRIPTION</div>
        </ModalLeftSide>
        <ModalRightSide>
          <MangoDeposit></MangoDeposit>
        </ModalRightSide>
      </div>
    </Modal>
  )
}

export default MangoDepositModal
