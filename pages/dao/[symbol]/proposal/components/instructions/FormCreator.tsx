import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import { useState, useEffect } from 'react'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { precision } from '@utils/formatting'
import Switch from '@components/Switch'

export enum InstructionInputType {
  GOVERNED_ACCOUNT,
  INPUT,
  TEXTAREA,
  SWITCH,
}

export interface InstructionInput {
  label: string
  initialValue: any
  name: string
  type: InstructionInputType
  inputType?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  onBlur?: () => void
  shouldBeGoverned?: false | ProgramAccount<Governance> | null
  governance?: ProgramAccount<Governance> | null
  options?: any[]
  hide?: boolean
  validateMinMax?: boolean
  precision?: number
  additionalComponent?: JSX.Element
}

const InstructionForm = ({
  inputs = [],
  setFormErrors,
  setForm,
  formErrors,
  outerForm,
}: {
  inputs: InstructionInput[]
  setFormErrors: React.Dispatch<React.SetStateAction<any>>
  formErrors
  setForm: React.Dispatch<React.SetStateAction<any>>
  outerForm: any
}) => {
  const [form, setInnerForm] = useState({})
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setInnerForm({ ...outerForm, [propertyName]: value })
  }
  useEffect(() => {
    setForm(form)
  }, [form])
  useEffect(() => {
    setInnerForm({
      ...inputs.reduce((a, v) => ({ ...a, [v.name]: v.initialValue }), {}),
    })
  }, [JSON.stringify(inputs.map((x) => x.initialValue))])
  return (
    <>
      {inputs
        .filter((x) => !x.hide)
        .map((x) => (
          <InstructionInput
            key={x.name}
            input={x}
            handleSetForm={handleSetForm}
            formErrors={formErrors || {}}
            form={form || {}}
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
            autoselectFirst={false}
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
      case InstructionInputType.INPUT: {
        const validateAmountOnBlur = () => {
          const value = form[input.name]
          const precisionFromMin = input.min ? precision(input.min) : 1
          handleSetForm({
            value: parseFloat(
              Math.max(
                Number(input.min ? input.min : 0),
                Math.min(
                  Number(
                    typeof input.max !== 'undefined'
                      ? input.max
                      : Number.MAX_SAFE_INTEGER
                  ),
                  Number(value)
                )
              ).toFixed(
                input.precision
                  ? input.precision
                  : precisionFromMin
                  ? precisionFromMin
                  : 0
              )
            ),
            propertyName: input.name,
          })
        }
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
            onBlur={
              input.onBlur
                ? input.onBlur
                : input.validateMinMax
                ? validateAmountOnBlur
                : null
            }
          />
        )
      }

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
      case InstructionInputType.SWITCH:
        return (
          <div className="text-sm mb-3">
            <div className="mb-2">{input.label}</div>
            <div className="flex flex-row text-xs items-center">
              <Switch
                checked={form[input.name]}
                onChange={(checked) =>
                  handleSetForm({
                    value: checked,
                    propertyName: input.name,
                  })
                }
              />
            </div>
          </div>
        )
    }
  }
  return (
    <>
      {getComponent()}
      {input.additionalComponent && input.additionalComponent}
    </>
  )
}

export default InstructionForm
