import AddMemberIcon from '@components/AddMemberIcon'
import CodeIcon from '@components/CodeIcon'
import MangoMakeIcon from '@components/MangoMakeIcon'
import MintTokensIcon from '@components/MintTokensIcon'
import ProgramUpgradeIcon from '@components/ProgramUpgradeIcon'
import TreasuryPaymentIcon from '@components/TreasuryPaymentIcon'
import { tooltipMessage } from './TooltipMessages'

export const getIcon = ({ icon }) => {
  const {
    treasuryPaymentTooltip,
    addNewMemberTooltip,
    programUpgradeTooltip,
    mintTokensTooltip,
  } = tooltipMessage()

  const helper: { [key: string]: any } = {
    treasury: (
      <TreasuryPaymentIcon
        className={`${treasuryPaymentTooltip !== '' && 'opacity-50'} w-8`}
        color={`${treasuryPaymentTooltip !== '' ? '#FFF' : '#000'}`}
      />
    ),
    upgrade: (
      <ProgramUpgradeIcon
        className="w-6"
        color={`${programUpgradeTooltip !== '' ? '#FFF' : '#000'}`}
      />
    ),
    'mint-tokens': (
      <MintTokensIcon
        className="w-6"
        color={`${mintTokensTooltip !== '' ? '#FFF' : '#000'}`}
      />
    ),
    mango: (
      <MangoMakeIcon
        className="w-6"
        color={`${programUpgradeTooltip !== '' ? '#FFF' : '#000'}`}
      />
    ),
    'new-member': (
      <AddMemberIcon
        className="w-6"
        color={`${addNewMemberTooltip !== '' ? '#FFF' : '#000'}`}
      />
    ),
    code: (
      <CodeIcon
        className="w-6"
        color={`${addNewMemberTooltip !== '' ? '#FFF' : '#E1CE7A'}`}
      />
    ),
  }

  return helper[icon] || ''
}

export default getIcon
