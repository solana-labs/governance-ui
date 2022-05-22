import React from 'react'
import { RadioGroup as HRG } from '@headlessui/react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: string
  error: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = '', ...props }, ref) => {
    let className =
      'block w-full px-2 py-4 m-0 font-sans text-2xl font-light transition ease-in-out bg-transparent border-b border-solid form-control placeholder:font-sans md:text-3xl hover:bg-white/5 focus:bg-transparent bg-clip-padding text-white/90 placeholder:text-white/30 focus:text-white focus:outline-none disabled:cursor-not-allowed disabled:hover:bg-transparent'
    if (error) {
      className += ` border-[#cb676f]/50 focus:border-red`
    } else {
      className += ` border-white/20 focus:border-white/50`
    }

    return (
      <div>
        <input type="text" className={className} ref={ref} {...props} />
        <div
          className={`${
            error ? 'visibile' : 'invisible'
          } pt-2 text-base md:text-lg text-red`}
        >
          {error}
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
  const buttonClass =
    'z-0 relative w-full transition-all duration-300 rounded-full font-serif text-[16px] hover:cursor-pointer disabled:cursor-not-allowed opacity-[84] disabled:opacity-50 hover:opacity-100 change-image-on-hover py-4 px-2 font-regular border border-white transition-to-white-background hover:text-black disabled:text-white'
  const selectedButtonClass = 'bg-white text-black'

  return (
    <HRG onChange={onChange} value={value} onBlur={onBlur} disabled={disabled}>
      <div className={`grid md:grid-cols-${options.length} gap-4`}>
        {options.map(({ label, value }) => {
          return (
            <HRG.Option value={value} key={label}>
              {({ checked }) => (
                <button
                  type="button"
                  className={`${buttonClass} ${
                    checked ? selectedButtonClass : ''
                  }`}
                >
                  {label}
                </button>
              )}
            </HRG.Option>
          )
        })}
      </div>
    </HRG>
  )
}
