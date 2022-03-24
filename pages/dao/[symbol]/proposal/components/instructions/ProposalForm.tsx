import { useState } from 'react'
import { Governance, ProgramAccount } from '@solana/spl-governance'

import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import { GovernedMultiTypeAccount } from '@utils/tokens'

import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import GovernedAccountSelect from '../GovernedAccountSelect'
import SelectedInstruction from './SelectedInstruction'

const ProposalForm = ({
  index,
  governance,
  itxType,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
  itxType: number
}) => {
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance

  const [governedAccount, setGovernanceAccount] = useState<
    GovernedMultiTypeAccount | undefined
  >()

  return (
    <>
      {![
        Instructions.Transfer,
        Instructions.Mint,
        Instructions.ProgramUpgrade,
        Instructions.SetProgramAuthority,
        Instructions.Base64,
        Instructions.Clawback,
        Instructions.Grant,
        Instructions.None,
        Instructions.FriktionDepositIntoVolt,
        Instructions.UXDInitializeController,
        Instructions.UXDSetRedeemableGlobalSupplyCap,
        Instructions.UXDSetMangoDepositoriesRedeemableSoftCap,
        Instructions.UXDRegisterMangoDepository,
        Instructions.UXDDepositInsuranceToMangoDepository,
        Instructions.UXDWithdrawInsuranceFromMangoDepository,
      ].includes(itxType) && (
        <GovernedAccountSelect
          label="Governance"
          governedAccounts={governedMultiTypeAccounts}
          onChange={(value) => {
            setGovernanceAccount(value)
          }}
          value={governedAccount}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
        />
      )}
      <SelectedInstruction
        itxType={itxType}
        index={index}
        governance={governance}
        governedAccount={governedAccount}
      />
    </>
  )
}

export default ProposalForm
