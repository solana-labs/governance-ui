import Modal from '@components/Modal'
import ModalHeader from './ModalHeader'
import SolendModalContent from './SolendModalContent'
import MangoDeposit from './MangoDepositComponent'
import BigNumber from 'bignumber.js'
import { SolendStrategy } from 'Strategies/types/types'

const DepositModal = ({
  onClose,
  proposedInvestment,
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
    <Modal onClose={onClose} isOpen={Boolean(proposedInvestment)}>
      <ModalHeader
        apy={apy}
        protocolLogoURI={protocolLogoSrc}
        protocolName={protocolName}
        TokenName={handledTokenName}
        strategy={strategyName}
      />
      {protocolName === 'Solend' ? (
        <SolendModalContent
          proposedInvestment={proposedInvestment as SolendStrategy}
          governedTokenAccount={governedTokenAccount}
          handledMint={handledMint}
          currentPosition={currentPosition}
          createProposalFcn={createProposalFcn}
        />
      ) : null}
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
