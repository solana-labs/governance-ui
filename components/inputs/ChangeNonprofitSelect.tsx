import { Listbox } from '@headlessui/react'
import { StyledLabel } from './styles'
import ErrorField from './ErrorField'
import Input from '@components/inputs/Input'
import { ChangeNonprofit } from '@utils/uiTypes/proposalCreationTypes'
import Loading from '@components/Loading'

const copyText = (textToCopy = '') => {
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
  isLoading = false,
}: {
  onSearch: any | undefined
  onSelect: any | undefined
  value: any | undefined
  children: any | undefined
  showSearchResults: boolean
  isLoading: boolean
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
                  {isLoading ? (
                    <div
                      style={{
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        alignItems: 'center',
                        zIndex: 10,
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10,
                        borderRadius: 35,
                      }}
                    >
                      <Loading />
                    </div>
                  ) : (
                    ''
                  )}
                  {isLoading && children.length === 0 ? (
                    <NonprofitSelect.Option
                      key={'loading-spinner'}
                      value={'loading-spinner'}
                    >
                      <span> </span>
                    </NonprofitSelect.Option>
                  ) : (
                    <></>
                  )}
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
        className={'text-xs px-3 py-3 max-w-lg'}
        style={{
          backgroundColor: '#0d99ff',
          color: 'white',
          borderRadius: '4px',
          display: nonprofitInformation ? 'block' : 'none',
        }}
      >
        {' '}
        👋 We recommend adding this description to the proposal description to
        help members understand the transaction: <br />
        <br />
        <span style={{ fontWeight: 'bold' }}>
          {nonprofitInformation?.name}
        </span>{' '}
        (EIN: {nonprofitInformation?.ein})<br />
        Mission: {nonprofitInformation?.description}
        <br />
        Read more information about {nonprofitInformation?.name} at&nbsp;
        <a
          href={
            'https://getchange.io/solana/cause/' +
            (nonprofitInformation
              ? nonprofitInformation.crypto.solana_address
              : '')
          }
          rel="noreferrer"
          target="_blank"
        >
          getchange.io/solana/cause/
          {nonprofitInformation?.crypto.solana_address.slice(0, 4)}...
        </a>
        <br />
        <button
          onClick={() =>
            copyText(
              nonprofitInformation?.name +
                ': ' +
                nonprofitInformation?.description +
                '\n' +
                'https://getchange.io/solana/cause/' +
                nonprofitInformation?.crypto.solana_address
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
