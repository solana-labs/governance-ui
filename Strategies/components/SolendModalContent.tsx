import { useState } from 'react'
import { SolendStrategy } from 'Strategies/types/types'
import ButtonGroup from '@components/ButtonGroup'
import { AssetAccount } from '@utils/uiTypes/assets'
import { CreateSolendStrategyParams } from 'Strategies/protocols/solend'
import SolendDeposit from './solend/SolendDeposit'
import SolendWithdraw from './solend/SolendWithdraw'

const DEPOSIT = 'Deposit'
const WITHDRAW = 'Withdraw'

const SolendDepositComponent = ({
  proposedInvestment,
  handledMint,
  createProposalFcn,
  governedTokenAccount,
}: {
  proposedInvestment: SolendStrategy
  handledMint: string
  createProposalFcn: CreateSolendStrategyParams
  governedTokenAccount: AssetAccount
}) => {
  const [proposalType, setProposalType] = useState('Deposit')

  const tabs = [DEPOSIT, WITHDRAW]

  return (
    <div>
      <div className="pb-4">
        <ButtonGroup
          activeValue={proposalType}
          className="h-10"
          onChange={(v) => setProposalType(v)}
          values={tabs}
        />
      </div>
      {proposalType === WITHDRAW && (
        <SolendWithdraw
          proposedInvestment={proposedInvestment}
          handledMint={handledMint}
          createProposalFcn={createProposalFcn}
          governedTokenAccount={governedTokenAccount}
        />
      )}
      {proposalType === DEPOSIT && (
        <SolendDeposit
          proposedInvestment={proposedInvestment}
          handledMint={handledMint}
          createProposalFcn={createProposalFcn}
          governedTokenAccount={governedTokenAccount}
        />
      )}
    </div>
  )
}

export default SolendDepositComponent
