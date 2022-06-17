import React from 'react'
import { RadioGroup as HRG } from '@headlessui/react'
import { preventNegativeNumberInput } from '@utils/helpers'

import { RadioButton } from '@components/Button'
import Text from '@components/Text'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: string
  error?: string
  success?: string
  Icon?: any
  suffix?: any
  className?: string
  warning?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error = '',
      success = '',
      value,
      Icon,
      suffix,
      className = '',
      autoComplete = 'off',
      warning = '',
      ...props
    },
    ref
  ) => {
    const hasContent = typeof value !== 'undefined' && value !== ''
    let classNames = `input-base form-control block w-full ${
      Icon ? 'pl-8' : 'pl-2'
    } ${
      suffix ? 'pr-8' : 'pr-2'
    } pt-[15px] pb-[21px] default-transition rounded-t rounded-b-none outline-none border-b border-b-bkg-4 bg-bkg-2`

    if (hasContent) {
      classNames += ` cursor-text`
    } else {
      classNames += ` cursor-pointer`
    }

    classNames += `
      placeholder:text-bkg-4
      active:bg-bkg-3
      focus:bg-bkg-3
      hover:bg-bkg-3
      hover:border-fgd-2

      focus:outline-none
      focus:border-primary-light

      active:border-primary-light

      disabled:cursor-not-allowed
      disabled:opacity-30
      disabled:hover:bg-bkg-2
      disabled:hover:border-b-bkg-4
      `

    if (error) {
      classNames += ` border-b-error-red/50 focus:border-b-error-red active:border-b-error-red`
    } else if (success) {
      classNames += ` border-b-green focus:border-b-green active:border-b-green`
    }

    classNames += ` ${className}`
    return (
      <div className="relative">
        <div
          className={`absolute top-[21px] left-2 max-w-[16px]  ${
            props.disabled ? 'opacity-30' : 'text-fgd-4'
          }`}
        >
          {Icon ? Icon : ''}
        </div>

        <div
          className={`absolute top-[21px] right-2 max-w-[16px]  ${
            props.disabled ? 'opacity-30' : 'text-fgd-4'
          }`}
        >
          {suffix ? suffix : ''}
        </div>

        <input
          type="text"
          className={classNames}
          ref={ref}
          value={value}
          autoComplete={autoComplete}
          {...props}
        />
        <FieldMessage
          error={error}
          warning={warning}
          success={success}
          className="min-h-[2.5rem]"
        />
      </div>
    )
  }
)

export default Input

export function FieldMessage({
  error = '',
  warning = '',
  success = '',
  className = '',
}) {
  return (
    <div
      className={`${
        error || warning || success ? 'visibile' : 'invisible'
      } pt-2 flex items-start ${
        error
          ? 'text-error-red'
          : warning
          ? 'text-orange'
          : success
          ? 'text-green'
          : ''
      } ${className}`}
    >
      <Text level="2" className="flex items-start">
        <span className="mr-1 align-text-bottom">
          {error ? (
            <svg
              className="inline align-text-top"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" />
              <path d="M4 4L12 12" stroke="currentColor" />
            </svg>
          ) : warning ? (
            <svg
              className="inline align-text-top"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
              <path
                d="M8.313 9.643L8.43 3H7.247L7.364 9.643H8.313ZM7.767 12.165C8.209 12.165 8.547 11.814 8.547 11.385C8.547 10.956 8.209 10.618 7.767 10.618C7.351 10.618 7 10.956 7 11.385C7 11.814 7.351 12.165 7.767 12.165Z"
                fill="currentColor"
              />
            </svg>
          ) : success ? (
            <svg
              className="inline align-text-top"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14 4L6 13L2 8" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <></>
          )}
        </span>
        <span>{error || warning || success}</span>
      </Text>
    </div>
  )
}

interface RadioGroupOption {
  label: string
  value: string | boolean | number
}
interface RadioGroupProps {
  options: RadioGroupOption[]
  onChange: any
  onBlur: any
  value: any
  disabled?: boolean
  disabledValues?: any[]
  error?: string
  warning?: string
  success?: string
}

export const RadioGroup = ({
  options,
  onChange,
  onBlur,
  value,
  disabled,
  disabledValues = [],
  error,
  warning,
  success,
}: RadioGroupProps) => {
  return (
    <>
      <HRG
        onChange={onChange}
        value={value}
        onBlur={onBlur}
        disabled={disabled}
      >
        <div className={`grid md:grid-cols-${options.length} gap-6`}>
          {options.map(({ label, value }) => {
            return (
              <HRG.Option
                value={value}
                key={label}
                disabled={disabled || disabledValues.indexOf(value) > -1}
              >
                {({ checked }) => (
                  <RadioButton
                    selected={checked}
                    disabled={disabled || disabledValues.indexOf(value) > -1}
                    className="w-full"
                  >
                    {label}
                  </RadioButton>
                )}
              </HRG.Option>
            )
          })}
        </div>
      </HRG>
      <FieldMessage error={error} warning={warning} success={success} />
    </>
  )
}

export function InputRangeSlider({
  field,
  error = '',
  placeholder = '50',
  disabled = false,
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-baseline sm:space-x-2">
      <div className="w-full sm:w-24">
        <Input
          type="tel"
          placeholder={placeholder}
          suffix={
            <Text level="1" className="">
              %
            </Text>
          }
          disabled={disabled}
          data-testid="dao-approval-threshold-input"
          error={error}
          className="text-center"
          {...field}
          onChange={(ev) => {
            preventNegativeNumberInput(ev)
            field.onChange(ev)
          }}
        />
      </div>{' '}
      <div
        className={`relative flex items-center w-full my-6 space-x-4 md:my-0 bg-bkg-2 h-[64px] rounded px-6 grow ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <Text level="2" className="opacity-60">
          0%
        </Text>
        <input
          type="range"
          min={1}
          className="w-full with-gradient focus:outline-none focus:ring-0 focus:shadow-none disabled:cursor-not-allowed"
          {...field}
          style={{
            backgroundSize: `${field.value || 50}% 100%`,
          }}
          disabled={disabled}
        />
        <Text level="2" className="opacity-60">
          100%
        </Text>
      </div>
    </div>
  )
}
