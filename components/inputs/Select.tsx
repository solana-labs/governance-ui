import { Listbox } from '@headlessui/react'
import styled from '@emotion/styled'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import { StyledPrefix, inputClasses } from './styles'
import ErrorField from './ErrorField'

const StyledDiv = styled.div`
  min-height: 2.5rem;
`

const Select = ({
  value,
  onChange,
  children,
  className = '',
  placeholder = '',
  error = '',
  disabled = false,
  prefix = '',
  componentLabel,
}: {
  value: any | undefined
  onChange: any | undefined
  children: any | undefined
  className?: string | undefined
  placeholder?: string | undefined
  error?: string | undefined
  disabled?: boolean | undefined
  prefix?: string | undefined
  componentLabel?: any | undefined
}) => {
  return (
    <>
      {prefix && <StyledPrefix>{prefix}</StyledPrefix>}
      <div className={`relative ${className}`}>
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          {({ open }) => (
            <>
              <Listbox.Button
                className={inputClasses({ className, disabled, prefix, error })}
              >
                <StyledDiv
                  className={`flex items-center justify-between space-x-4 p-2 text-th-fgd-1`}
                >
                  {componentLabel
                    ? componentLabel
                    : value
                    ? value
                    : placeholder}
                  {open ? (
                    <ChevronUpIcon className={`h-5 w-5 mr-1 text-th-primary`} />
                  ) : (
                    <ChevronDownIcon
                      className={`h-5 w-5 mr-1 text-th-primary`}
                    />
                  )}
                </StyledDiv>
              </Listbox.Button>
              {open ? (
                <Listbox.Options
                  static
                  className={`text-th-fgd-1 max-h-60 overflow-auto z-20 w-full p-1 absolute left-0 mt-1 bg-bkg-1 origin-top-left divide-y divide-th-bkg-3 shadow-lg outline-none rounded-md thin-scroll`}
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
          className={`p-2 hover:bg-th-bkg-3 hover:cursor-pointer tracking-wider ${
            selected && `text-th-primary`
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
