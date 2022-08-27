import { AssetAccount } from '@utils/uiTypes/assets'
import { TreasuryStrategy } from 'Strategies/types/types'

export const PsyFiStrategies: React.FC<{
  proposedInvestment: TreasuryStrategy
  governedTokenAccount: AssetAccount
  handledMint: string
  createProposalFcn: any
}> = ({ proposedInvestment }) => {
  console.log('*** proposed investment', proposedInvestment)
  return <div>Hello PsyFi world.</div>
}
