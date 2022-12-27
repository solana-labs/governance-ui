import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import React, { useState, useEffect } from 'react'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { precision } from '@utils/formatting'
import Switch from '@components/Switch'
import Select from '@components/inputs/Select'
import { usePrevious } from '@hooks/usePrevious'
import { DISABLED_VALUE } from '@tools/constants'

export enum InstructionInputType {
  GOVERNED_ACCOUNT,
  INPUT,
  TEXTAREA,
  SWITCH,
  SELECT,
  DISABLEABLE_INPUT,
}

export interface InstructionInput {
  label: string
  initialValue: any
  name: string
  type: InstructionInputType
  assetType?: 'mint' | 'token' | 'wallet'
  inputType?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  onBlur?: () => void
  shouldBeGoverned?: boolean
  governance?: ProgramAccount<Governance> | null
  options?: any[]
  hide?: boolean | (() => boolean)
  validateMinMax?: boolean
  precision?: number
  additionalComponent?: JSX.Element | null
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
  const previousInitialValue = usePrevious(
    JSON.stringify(inputs.map((x) => x.initialValue))
  )
  useEffect(() => {
    setForm(form)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(form)])
  useEffect(() => {
    setInnerForm({
      ...inputs.reduce((a, v) => ({ ...a, [v.name]: v.initialValue }), {}),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    previousInitialValue !== JSON.stringify(inputs.map((x) => x.initialValue)),
  ])
  return (
    <>
      {inputs
        .filter((x) => !(typeof x.hide === 'function' ? x.hide() : x.hide))
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
            autoSelectFirst={false}
            label={input.label}
            governedAccounts={input.options!}
            onChange={(value) => {
              handleSetForm({ value, propertyName: input.name })
            }}
            value={form[input.name]}
            error={formErrors[input.name]}
            shouldBeGoverned={input.shouldBeGoverned}
            governance={input.governance}
            type={input.assetType}
          />
        )
      case InstructionInputType.SELECT:
        return (
          <Select
            label={input.label}
            // Note that this is different from native selects, which simply use the value as the value, not the name-value pair.
            value={form[input.name]?.name}
            placeholder="Please select..."
            onChange={(value) => {
              handleSetForm({ value, propertyName: input.name })
            }}
            error={formErrors[input.name]}
          >
            {input.options?.map((x, idx) => (
              <Select.Option key={idx} value={x}>
                <div className="flex flex-col">
                  <span>{x.name}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
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

      // DISABLEABLE_INPUT is for concealing ugly numbers; it uses a toggle to disable the setting (by setting it to u64::max)
      case InstructionInputType.DISABLEABLE_INPUT: {
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
          <div className="max-w-lg">
            <div className="text-sm mb-3">
              <div className="mb-2">{input.label}</div>
              <div className="flex flex-row text-xs items-center">
                <Switch
                  checked={
                    form[input.name]?.toString() !== DISABLED_VALUE.toString()
                  }
                  onChange={(checked) =>
                    handleSetForm({
                      value: checked ? 1 : DISABLED_VALUE,
                      propertyName: input.name,
                    })
                  }
                />
                <div className="ml-3 grow">
                  {form[input.name]?.toString() !==
                  DISABLED_VALUE.toString() ? (
                    <Input
                      className="ml-1"
                      min={input.min}
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
                  ) : (
                    'Disabled'
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
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
