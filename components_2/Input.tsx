import React from 'react'
import { RadioGroup as HRG } from '@headlessui/react'
import Button from './ProductButtons'
import Text from './ProductText'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: string
  error?: string
  success?: string
  Icon?: any
  suffix?: any
  className?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { error = '', success = '', value, Icon, suffix, className = '', ...props },
    ref
  ) => {
    const hasContent = typeof value !== 'undefined' && value !== ''
    let classNames = `input-base form-control block w-full ${
      Icon ? 'pl-8' : 'pl-2'
    } ${
      suffix ? 'pr-8' : 'pr-2'
    } pt-[15px] pb-[21px] default-transition rounded-t rounded-b-none outline-none border-0 border-b bg-transparent`

    if (hasContent) {
      classNames += ` border-white text-white`
    } else {
      classNames += `  border-white/20`
    }

    classNames += `

      
      

      placeholder:text-white/30 
      active:placeholder:text-white/10 
      focus:placeholder:text-white/10 

      hover:bg-white/5

      focus:bg-[rgba(255,255,255,0.03)]
      focus:text-white 
      focus:outline-none 
      focus:border-b-[#00E4FF]

      active:bg-[rgba(255,255,255,0.03)]
      active:border-b-[#00E4FF]
      
      disabled:placeholder:text-white/30
      disabled:active:border-b-white/20
      disabled:cursor-not-allowed 
      disabled:hover:bg-transparent
      `

    if (error) {
      classNames += ` border-b-error-red/50 focus:border-b-error-red active:border-b-error-red`
    } else if (success) {
      classNames += ` border-b-confirm-green/50 focus:border-b-confirm-green active:border-b-confirm-green`
    }

    classNames += ` ${className}`
    return (
      <div className="relative">
        <div className="absolute top-[21px] left-2 max-w-[16px] text-white/30">
          {Icon ? Icon : ''}
        </div>

        <div className="absolute top-[21px] right-2 max-w-[16px] text-white/30">
          {suffix ? suffix : ''}
        </div>

        <input type="text" className={classNames} ref={ref} {...props} />
        <div
          className={`${
            error || success ? 'visibile' : 'invisible'
          } pt-2 flex items-start space-x-1 min-h-[2.5rem] ${
            error ? 'text-error-red' : success ? 'text-confirm-green' : ''
          }`}
        >
          <div className="pt-[1px]">
            {error ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" />
                <path d="M4 4L12 12" stroke="currentColor" />
              </svg>
            ) : success ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 4L6 13L2 8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <></>
            )}
          </div>
          <Text level="2">{error || success}</Text>
        </div>
      </div>
    )
  }
)

export default Input

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
}

export const RadioGroup = ({
  options,
  onChange,
  value,
  disabled,
  onBlur,
}: RadioGroupProps) => {
  return (
    <HRG onChange={onChange} value={value} onBlur={onBlur} disabled={disabled}>
      <div className={`grid md:grid-cols-${options.length} gap-6`}>
        {options.map(({ label, value }) => {
          return (
            <HRG.Option value={value} key={label}>
              {({ checked }) => (
                <Button
                  radio
                  selected={checked}
                  disabled={disabled}
                  className="w-full"
                >
                  {label}
                </Button>
              )}
            </HRG.Option>
          )
        })}
      </div>
    </HRG>
  )
}
