import Modal from '@components/Modal'
import ModalHeader from '@components/TreasuryAccount/BigView/ModalHeader'
import ModalLeftSide from '@components/TreasuryAccount/BigView/ModalLeftSide'
import ModalRightSide from '@components/TreasuryAccount/BigView/ModalRightSide'
import Deposit from './DepositComponent'

const DepositModal = ({
  onClose,
  isOpen,
  handledMint,
  liquidity,
  apy,
  protocolName,
  protocolLogoSrc,
  handledTokenName,
  strategyName,
  strategyDescription,
  currentPosition,
  createProposalFcn,
}) => {
  return (
    <Modal sizeClassName="max-w-6xl" onClose={onClose} isOpen={isOpen}>
      <ModalHeader
        protocolLogoURI={protocolLogoSrc}
        protocolName={protocolName}
        TokenName={handledTokenName}
        strategy={strategyName}
      ></ModalHeader>
      <div className="flex flex-items">
        <ModalLeftSide
          strategy={strategyName}
          liquidity={liquidity}
          projectedYield={apy}
        >
          <div>{strategyDescription}</div>
        </ModalLeftSide>
        <ModalRightSide>
          <Deposit
            handledMint={handledMint}
            currentPosition={currentPosition}
            createProposalFcn={createProposalFcn}
          ></Deposit>
        </ModalRightSide>
      </div>
    </Modal>
  )
}

export default DepositModal
