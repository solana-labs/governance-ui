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
  useDefaultStyle = true,
  noMaxWidth = false,
  wrapperClassNames = '',
  mintWidth = '',
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
  useDefaultStyle?: boolean
  noMaxWidth?: boolean
  wrapperClassNames?: string
  mintWidth?: string
}) => {
  return (
    <div
      className={`mt-6 ${wrapperClassNames}`}
      style={{ minWidth: mintWidth }}
    >
      {label && <StyledLabel>{label}</StyledLabel>}
      <div className={`relative ${className} ${error && 'pb-1'}`}>
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          {({ open }) => (
            <>
              <Listbox.Button
                className={inputClasses({
                  className,
                  disabled,
                  error,
                  useDefaultStyle,
                  noMaxWidth,
                })}
              >
                <div
                  className={`flex items-center justify-between text-fgd-1 text-left`}
                >
                  {componentLabel
                    ? componentLabel
                    : value
                    ? value
                    : placeholder}
                  {open ? (
                    <ChevronUpIcon
                      className={`flex-shrink-0 h-5 w-5 mr-1 text-primary-light`}
                    />
                  ) : (
                    <ChevronDownIcon
                      className={`flex-shrink-0 h-5 w-5 mr-1 text-primary-light`}
                    />
                  )}
                </div>
              </Listbox.Button>
              {open ? (
                <Listbox.Options
                  static
                  className={`text-fgd-1 text-sm max-h-64 ${
                    !noMaxWidth && 'max-w-lg'
                  } overflow-auto z-20 w-full p-1 absolute left-0 mt-1 bg-bkg-1 origin-top-left divide-y divide-bkg-3 shadow-lg outline-none rounded-md thin-scroll`}
                >
                  {children}
                </Listbox.Options>
              ) : null}
            </>
          )}
        </Listbox>
        <ErrorField text={error}></ErrorField>
      </div>
    </div>
  )
}

const Option = ({ value, children, className = '' }) => {
  return (
    <Listbox.Option value={value}>
      {({ selected }) => (
        <div
          className={`default-transition px-2 py-3 hover:bg-bkg-2 hover:cursor-pointer tracking-wider ${
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
