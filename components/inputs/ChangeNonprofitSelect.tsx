import { Listbox } from '@headlessui/react'
import { StyledLabel } from './styles'
import ErrorField from './ErrorField'
import Input from '@components/inputs/Input'
import { ChangeNonprofit } from '@utils/uiTypes/proposalCreationTypes'

const copyText = (textToCopy: string = '') => {
  navigator.clipboard.writeText(textToCopy)
}
const NonprofitSelect = ({
  value,
  onSearch,
  onSelect,
  children,
  className = '',
  error = '',
  nonprofitInformation,
  disabled = false,
  noMaxWidth = false,
  wrapperClassNames = '',
  minWidth = '',
  showSearchResults = false,
}: {
  onSearch: any | undefined
  onSelect: any | undefined
  value: any | undefined
  children: any | undefined
  showSearchResults: boolean
  nonprofitInformation?: ChangeNonprofit | undefined
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
    <div
      className={`${wrapperClassNames}`}
      style={minWidth ? { minWidth: minWidth } : {}}
    >
      {<StyledLabel>{'Nonprofit name or EIN'}</StyledLabel>}
      <div className={`relative ${className} ${error && 'pb-1'}`}>
        <Input value={value} onChange={onSearch} type="text" />
        <div style={{ display: showSearchResults ? 'block' : 'none' }}>
          <Listbox
            value={'drop-down-search'}
            onChange={onSelect}
            disabled={disabled}
          >
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
        </div>
        <ErrorField text={error}></ErrorField>
      </div>
      <div
        className={'text-xs px-3 py-3 bg-orange text-fgd-4 max-w-lg'}
        style={{
          borderRadius: '4px',
          display: nonprofitInformation ? 'block' : 'none',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>{nonprofitInformation?.name}</span>{' '}
        (EIN: {nonprofitInformation?.ein})<br />
        Mission: {nonprofitInformation?.description}
        <br />
        <button
          onClick={() =>
            copyText(
              nonprofitInformation?.name +
                ': ' +
                nonprofitInformation?.description
            )
          }
        >
          <i>Copy description to clipboard</i>
        </button>
      </div>
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

NonprofitSelect.Option = Option

export default NonprofitSelect
