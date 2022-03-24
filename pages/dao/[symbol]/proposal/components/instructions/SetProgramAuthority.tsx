import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SetProgramAuthorityForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletStore from 'stores/useWalletStore'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { validateInstruction } from '@utils/instructionTools'
import createSetProgramAuthorityInstruction from '@tools/sdk/bpfUpgradeableLoader/createSetProgramAuthorityInstruction'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
  GovernanceAccountType,
} from '@solana/spl-governance'

const SetProgramAuthority = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountType } = useGovernanceAssets()
  const governedProgramAccounts = getGovernancesByAccountType(
    GovernanceAccountType.ProgramGovernanceV1
  ).map((x) => {
    return {
      governance: x,
    }
  })
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SetProgramAuthorityForm>({
    governedAccount: undefined,
    accountId: programId?.toString(),
    destinationAuthority: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const upgradeIx = await createSetProgramAuthorityInstruction(
        form.governedAccount.governance.account.governedAccount,
        form.governedAccount.governance.pubkey,
        new PublicKey(form.destinationAuthority)
      )
      serializedInstruction = serializeInstructionToBase64(upgradeIx)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    if (form.destinationAuthority) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.destinationAuthority])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    destinationAuthority: yup
      .string()
      .required('new authority address is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Program"
        governedAccounts={governedProgramAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="New Authority"
        value={form.destinationAuthority}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAuthority',
          })
        }
        error={formErrors['destinationAuthority']}
      />
    </>
  )
}

export default SetProgramAuthority
