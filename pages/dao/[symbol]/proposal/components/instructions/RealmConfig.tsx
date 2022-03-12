import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { validateInstruction } from '@utils/instructionTools'
import {
  Base64InstructionForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useRealm from '@hooks/useRealm'
import {
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
} from '@tools/sdk/units'

const RealmConfig = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, mint } = useRealm()
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<Base64InstructionForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      serializedInstruction = form!.base64
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form!.governedAccount?.governance,
      customHoldUpTime: form!.holdUpTime,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    base64: yup
      .string()
      .required('Instruction is required')
      .test('base64Test', 'Invalid base64', function (val: string) {
        if (val) {
          try {
            getInstructionDataFromBase64(val)
            return true
          } catch (e) {
            return false
          }
        } else {
          return this.createError({
            message: `Instruction is required`,
          })
        }
      }),
  })
  //   const validateAmountOnBlur = () => {
  //     const value = form.holdUpTime

  //     handleSetForm({
  //       value: parseFloat(
  //         Math.max(
  //           Number(0),
  //           Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
  //         ).toFixed()
  //       ),
  //       propertyName: 'holdUpTime',
  //     })
  //   }
  const minCommunity = mint ? getMintMinAmountAsDecimal(mint) : 0
  const minCommunityTokensToCreateProposal = getMintDecimalAmount(
    mint!,
    realm!.account.config.minCommunityTokensToCreateGovernance
  )
  const inputs = [
    {
      label: 'Governance',
      initialValue: null,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned,
      governance: governance,
      options: governedMultiTypeAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
    },
    {
      label: 'Min community tokens to create governance',
      initialValue: minCommunityTokensToCreateProposal,
      name: 'minCommunityTokensToCreateGovernance',
      type: InstructionInputType.INPUT,
      inputType: 'number',
      min: minCommunity,
      step: minCommunity,
      hide: !mint,
    },
    {
      label: 'Community voter weight addin',
      initialValue: '',
      name: 'communityVoterWeightAddin',
      type: InstructionInputType.INPUT,
      inputType: 'text',
    },
  ]
  return (
    <>
      <InstructionForm
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default RealmConfig

enum InstructionInputType {
  GOVERNED_ACCOUNT,
  INPUT,
  TEXTAREA,
}

interface InstructionInput {
  label: string
  initialValue: any
  name: string
  type: InstructionInputType
  inputType?: string
  placeholder?: string
  min?: number
  step?: number
  onBlur?: () => void
  shouldBeGoverned?: false | ProgramAccount<Governance> | null
  governance?: ProgramAccount<Governance> | null
  options?: any[]
  hide?: boolean
}

const InstructionForm = ({
  inputs,
  setFormErrors,
  setForm,
  formErrors,
}: {
  inputs: InstructionInput[]
  setFormErrors: React.Dispatch<React.SetStateAction<any>>
  formErrors
  setForm: React.Dispatch<React.SetStateAction<any>>
}) => {
  const [form, setInnerForm] = useState({
    ...inputs.reduce((a, v) => ({ ...a, [v.name]: v.initialValue }), {}),
  })
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setInnerForm({ ...form, [propertyName]: value })
  }
  useEffect(() => {
    setForm(form)
  }, [form])
  return (
    <>
      {inputs
        .filter((x) => !x.hide)
        .map((x) => (
          <InstructionInput
            key={x.name}
            input={x}
            handleSetForm={handleSetForm}
            formErrors={formErrors}
            form={form}
          ></InstructionInput>
        ))}
    </>
  )
}

const InstructionInput = ({
  input,
  handleSetForm,
  formErrors,
  form,
}: {
  input: InstructionInput
  handleSetForm: ({
    propertyName,
    value,
  }: {
    propertyName: string
    value: any
  }) => void
  formErrors
  form
}) => {
  const getComponent = () => {
    switch (input.type) {
      case InstructionInputType.GOVERNED_ACCOUNT:
        return (
          <GovernedAccountSelect
            label={input.label}
            governedAccounts={input.options!}
            onChange={(value) => {
              handleSetForm({ value, propertyName: input.name })
            }}
            value={form[input.name]}
            error={formErrors[input.name]}
            shouldBeGoverned={input.shouldBeGoverned}
            governance={input.governance}
          />
        )
      case InstructionInputType.INPUT:
        return (
          <Input
            min={input.min}
            label={input.label}
            value={form[input.name]}
            type={input.inputType!}
            onChange={(event) => {
              handleSetForm({
                value: event.target.value,
                propertyName: input.name,
              })
            }}
            step={input.step}
            error={formErrors[input.name]}
            onBlur={input.onBlur}
          />
        )
      case InstructionInputType.TEXTAREA:
        return (
          <Textarea
            label={input.label}
            placeholder={input.placeholder}
            wrapperClassName="mb-5"
            value={form[input.name]}
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: input.name,
              })
            }
            error={formErrors[input.name]}
          ></Textarea>
        )
    }
  }
  return getComponent()
}
