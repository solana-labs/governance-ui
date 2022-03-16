import Modal from '@components/Modal'
import ModalHeader from './ModalHeader'
import MangoDeposit from './MangoDepositComponent'
import BigNumber from 'bignumber.js'

const DepositModal = ({
  onClose,
  isOpen,
  handledMint,
  apy,
  protocolName,
  protocolLogoSrc,
  handledTokenName,
  strategyName,
  currentPosition,
  createProposalFcn,
  mangoAccounts,
  governedTokenAccount,
}) => {
  const currentPositionFtm = new BigNumber(
    currentPosition.toFixed(0)
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
          governedTokenAccount={governedTokenAccount}
          mangoAccounts={mangoAccounts}
          handledMint={handledMint}
          currentPositionFtm={currentPositionFtm}
          createProposalFcn={createProposalFcn}
        ></MangoDeposit>
      ) : null}
    </Modal>
  )
}

export default DepositModal
