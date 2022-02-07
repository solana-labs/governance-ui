import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  EmptyInstructionForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { validateInstruction } from '@utils/instructionTools'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'

const Empty = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<EmptyInstructionForm>({
    governedAccount: undefined,
  })
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
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })
  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
    </>
  )
}

export default Empty
