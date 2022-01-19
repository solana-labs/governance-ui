import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  EmptyInstructionForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { validateInstruction } from '@utils/instructionTools'

const Empty = ({
  index,
  governance,
  setProposalTitle,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
  setProposalTitle
}) => {
  const {
    governancesArray,
    governedTokenAccounts,
    getMintWithGovernances,
  } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const [governedAccounts, setGovernedAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])

  const [form, setForm] = useState<EmptyInstructionForm>({
    governedAccount: undefined,
  })

  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  useEffect(() => {
    async function prepGovernances() {
      const mintWithGovernances = await getMintWithGovernances()
      const matchedGovernances = governancesArray.map((gov) => {
        const governedTokenAccount = governedTokenAccounts.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        const mintGovernance = mintWithGovernances.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        if (governedTokenAccount) {
          return governedTokenAccount as GovernedMultiTypeAccount
        }
        if (mintGovernance) {
          return mintGovernance as GovernedMultiTypeAccount
        }
        return {
          governance: gov,
        }
      })
      setGovernedAccounts(matchedGovernances)
    }
    prepGovernances()
  }, [])

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

  useEffect(() => {
    setProposalTitle('Vote only')
  }, [])

  return (
    <>
      <GovernedAccountSelect
        noMaxWidth
        useDefaultStyle={false}
        className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
        label="Governance"
        governedAccounts={governedAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
    </>
  )
}

export default Empty
