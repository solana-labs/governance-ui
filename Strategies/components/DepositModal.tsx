import Modal from '@components/Modal'
import ModalHeader from './ModalHeader'
import MangoDeposit from './MangoDepositComponent'
import BigNumber from 'bignumber.js'

const DepositModal = ({
  onClose,
  isOpen,
  handledMint,
  // liquidity,
  apy,
  protocolName,
  protocolLogoSrc,
  handledTokenName,
  strategyName,
  // strategyDescription,
  currentPosition,
  createProposalFcn,
}) => {
  const currentPositionFtm = new BigNumber(
    currentPosition.toNumber().toFixed(0)
  ).toFormat()
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalHeader
        apy={apy}
        protocolLogoURI={protocolLogoSrc}
        protocolName={protocolName}
        TokenName={handledTokenName}
        strategy={strategyName}
      />

      {protocolName === 'Mango' ? (
        <MangoDeposit
          handledMint={handledMint}
          currentPositionFtm={currentPositionFtm}
          currentPosition={currentPosition}
          createProposalFcn={createProposalFcn}
        ></MangoDeposit>
      ) : null}
    </Modal>
  )
}

export default DepositModal
