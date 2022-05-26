import React from 'react'
import { RadioGroup as HRG } from '@headlessui/react'
import Button from './ProductButtons'
import Text from './ProductText'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: string
  error?: string
  success?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = '', success = '', value, ...props }, ref) => {
    const hasContent = typeof value !== 'undefined' && value !== ''
    let className =
      'input-base form-control block w-full pl-2 pt-[15px] pb-[21px] default-transition rounded-t rounded-b-none outline-none border-0 border-b bg-transparent'

    if (hasContent) {
      className += ` border-white text-white`
    } else {
      className += `  border-white/20`
    }

    className += `

      
      

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
      
      disabled:cursor-not-allowed 
      disabled:hover:bg-transparent
      `

    if (error) {
      className += ` border-b-error-red/50 focus:border-b-error-red active:border-b-error-red`
    } else if (success) {
      className += ` border-b-confirm-green/50 focus:border-b-confirm-green active:border-b-confirm-green`
    }

    return (
      <div>
        <input type="text" className={className} ref={ref} {...props} />
        <div
          className={`${
            error || success ? 'visibile' : 'invisible'
          } pt-2 flex items-start space-x-2 min-h-[2.5rem] ${
            error ? 'text-error-red' : success ? 'text-confirm-green' : ''
          }`}
        >
          <div className="pt-[2px]">
            {error ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.5852 13.2894C11.3569 14.355 9.75379 15 8 15C4.13401 15 1 11.866 1 8C1 6.24621 1.64496 4.64307 2.71063 3.4148L12.5852 13.2894ZM13.2921 12.5821L3.41794 2.7079C4.6458 1.64386 6.24771 1 8 1C11.866 1 15 4.13401 15 8C15 9.75229 14.3561 11.3542 13.2921 12.5821ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8Z"
                  fill="currentColor"
                />
              </svg>
            ) : success ? (
              <svg
                width="16"
                height="13"
                viewBox="0 0 16 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.4141 3.41436L5.99991 12.8286L0.585693 7.41437L3.41412 4.58594L5.99991 7.17172L12.5857 0.585938L15.4141 3.41436Z"
                  fill="currentColor"
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
