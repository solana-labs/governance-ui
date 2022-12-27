import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import {
  EmptyInstructionForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useRealm from '@hooks/useRealm'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
const Empty = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<EmptyInstructionForm>({
    governedAccount: undefined,
  })
  const { ownVoterWeight } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const obj: UiInstruction = {
      serializedInstruction: '',
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })
  return (
    <GovernedAccountSelect
      label="Wallet"
      governedAccounts={assetAccounts.filter((x) =>
        ownVoterWeight.canCreateProposal(x.governance.account.config)
      )}
      onChange={(value) => {
        handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={form.governedAccount}
      error={formErrors['governedAccount']}
      shouldBeGoverned={shouldBeGoverned}
      governance={governance}
    />
  )
}

export default Empty
