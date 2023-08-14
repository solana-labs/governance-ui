import Modal from '@components/Modal'
import ModalHeader from './ModalHeader'
import SolendModalContent from './SolendModalContent'
import { SolendStrategy } from 'Strategies/types/types'
import { PsyFiStrategies } from './psyfi'
import { AssetAccount } from '@utils/uiTypes/assets'

const DepositModal = ({
  onClose,
  proposedInvestment,
  handledMint,
  apy,
  protocolName,
  protocolLogoSrc,
  handledTokenName,
  strategyName,
  createProposalFcn,
  governedTokenAccount,
}: {
  onClose: () => void
  proposedInvestment: any
  handledMint: string
  apy: string
  protocolName: string
  protocolLogoSrc: string
  handledTokenName: string
  strategyName: string
  createProposalFcn: any
  governedTokenAccount: AssetAccount
}) => {
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
          createProposalFcn={createProposalFcn}
        />
      ) : null}
      {/* TODO: Add the PsyFi modal */}
      {protocolName === 'PsyFi' ? (
        <PsyFiStrategies
          proposedInvestment={proposedInvestment}
          governedTokenAccount={governedTokenAccount}
          handledMint={handledMint}
          createProposalFcn={createProposalFcn}
        />
      ) : null}
    </Modal>
  )
}

export default DepositModal
