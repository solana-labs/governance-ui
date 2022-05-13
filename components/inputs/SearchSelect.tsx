import { Listbox } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { StyledLabel, inputClasses } from './styles'
import ErrorField from './ErrorField'

const SearchSelect = ({
  value,
  onChange,
  children,
  className = '',
  error = '',
  disabled = false,
  noMaxWidth = false,
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
  minWidth?: string
}) => {
  return (
    <div className={`relative ${className} ${error && 'pb-1'}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {() => (
          <>
            <Listbox.Options
              static
              className={`text-fgd-1 text-sm max-h-64 ${
                !noMaxWidth && 'max-w-lg'
              } 
                  overflow-auto z-20 w-full p-1 absolute left-0 mt-1 bg-bkg-1 origin-top-left divide-y divide-bkg-3 shadow-lg outline-none rounded-md thin-scroll`}
            >
              {children}
            </Listbox.Options>
            )
          </>
        )}
      </Listbox>
      <ErrorField text={error}></ErrorField>
    </div>
  )
}

const Option = ({ value, children, className = '' }) => {
  return (
    <Listbox.Option value={value}>
      {({ selected }) => (
        <div
          className={`default-transition px-2 py-3 hover:bg-bkg-2 hover:cursor-pointer text-fgd-2 tracking-wider ${
            selected && `text-primary-light`
          } ${className}`}
        >
          {children}
        </div>
      )}
    </Listbox.Option>
  )
}

SearchSelect.Option = Option

export default SearchSelect
