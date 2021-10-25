import { Listbox } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import { StyledLabel, inputClasses } from './styles'
import ErrorField from './ErrorField'

const Select = ({
  value,
  onChange,
  children,
  className = '',
  placeholder = '',
  error = '',
  disabled = false,
  label = '',
  componentLabel,
}: {
  value: any | undefined
  onChange: any | undefined
  children: any | undefined
  className?: string | undefined
  placeholder?: string | undefined
  error?: string | undefined
  disabled?: boolean | undefined
  label?: string | undefined
  componentLabel?: any | undefined
}) => {
  return (
    <>
      {label && <StyledLabel>{label}</StyledLabel>}
      <div className={`relative ${className}`}>
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          {({ open }) => (
            <>
              <Listbox.Button
                className={inputClasses({ className, disabled, error })}
              >
                <div className={`flex items-center justify-between text-fgd-1`}>
                  {componentLabel
                    ? componentLabel
                    : value
                    ? value
                    : placeholder}
                  {open ? (
                    <ChevronUpIcon
                      className={`h-5 w-5 mr-1 text-primary-light`}
                    />
                  ) : (
                    <ChevronDownIcon
                      className={`h-5 w-5 mr-1 text-primary-light`}
                    />
                  )}
                </div>
              </Listbox.Button>
              {open ? (
                <Listbox.Options
                  static
                  className={`text-fgd-1 max-h-60 overflow-auto z-20 w-full p-1 absolute left-0 mt-1 bg-bkg-1 origin-top-left divide-y divide-th-bkg-3 shadow-lg outline-none rounded-md thin-scroll`}
                >
                  {children}
                </Listbox.Options>
              ) : null}
            </>
          )}
        </Listbox>
      </div>
      <ErrorField text={error}></ErrorField>
    </>
  )
}

const Option = ({ value, children, className = '' }) => {
  return (
    <Listbox.Option value={value}>
      {({ selected }) => (
        <div
          className={`p-2 hover:bg-bkg-3 hover:cursor-pointer tracking-wider ${
            selected && `text-primary-light`
          } ${className}`}
        >
          {children}
        </div>
      )}
    </Listbox.Option>
  )
}

Select.Option = Option

export default Select
