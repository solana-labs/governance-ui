import Modal from '@components/Modal'
import ModalHeader from './ModalHeader'
import SolendModalContent from './SolendModalContent'
import MangoDeposit from './MangoDepositComponent'
import BigNumber from 'bignumber.js'
import { SolendStrategy } from 'Strategies/types/types'
import EverlendModalContent from './EverlendModalContent'
import { PsyFiStrategies } from './psyfi'
import { AssetAccount } from '@utils/uiTypes/assets'
import { MangoAccount } from '@blockworks-foundation/mango-client'

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
}: {
  onClose: () => void
  proposedInvestment: any
  handledMint: string
  apy: string
  protocolName: string
  protocolLogoSrc: string
  handledTokenName: string
  strategyName: string
  currentPosition: number
  createProposalFcn: any
  mangoAccounts: MangoAccount[]
  governedTokenAccount: AssetAccount
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
      {protocolName === 'Everlend' ? (
        <EverlendModalContent
          proposedInvestment={proposedInvestment}
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
