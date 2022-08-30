import { AssetAccount } from '@utils/uiTypes/assets'
import { CreatePsyFiStrategy } from 'Strategies/protocols/psyfi/types'
import { PsyFiStrategy } from 'Strategies/types/types'
import { Deposit } from './Deposit'

export const PsyFiStrategies: React.FC<{
  proposedInvestment: PsyFiStrategy
  governedTokenAccount: AssetAccount
  handledMint: string
  createProposalFcn: CreatePsyFiStrategy
}> = ({
  createProposalFcn,
  handledMint,
  proposedInvestment,
  governedTokenAccount,
}) => {
  return (
    <div>
      {/* 
            TODO: Add a higher level selector that determines the action (Deposit, 
            Withdraw, Cancel pending deposit, etc) and separate out the action components.
        */}
      <Deposit
        createProposalFcn={createProposalFcn}
        handledMint={handledMint}
        proposedInvestment={proposedInvestment}
        governedTokenAccount={governedTokenAccount}
      />
    </div>
  )
}
