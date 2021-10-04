import { useReducer } from 'react'
import styled from '@emotion/styled'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import Switch from './Switch'

const initialFilterSettings = {
  Cancelled: true,
  Completed: true,
  Defeated: true,
  Draft: true,
  Executing: true,
  ExecutingWithErrors: true,
  SigningOff: true,
  Succeeded: true,
  Voting: true,
}

const StyledAlertCount = styled.span`
  font-size: 0.6rem;
`

const ProposalFilter = ({ filters, setFilters }) => {
  const [filterSettings, setFilterSettings] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialFilterSettings
  )

  const handleFilters = (name, checked) => {
    setFilterSettings({ [name]: checked })
    if (!checked) {
      setFilters([...filters, name])
    } else {
      setFilters(filters.filter((n) => n !== name))
    }
  }

  return (
    <Disclosure as="div" className="relative">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`border border-fgd-4 default-transition font-normal pl-3 pr-2 py-2.5 rounded-md text-fgd-1 text-sm hover:bg-bkg-3 focus:outline-none`}
          >
            {filters.length > 0 ? (
              <div className="absolute -top-3 -right-1.5 z-20">
                {/* <span className="flex h-4 w-4 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span> */}
                <StyledAlertCount className="w-4 h-4 bg-red relative inline-flex rounded-full flex items-center justify-center">
                  {filters.length}
                </StyledAlertCount>
                {/* </span> */}
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              Filter
              <ChevronDownIcon
                className={`default-transition h-5 w-5 ml-1 ${
                  open ? 'transform rotate-180' : 'transform rotate-360'
                }`}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={`bg-bkg-3 mt-2 p-4 absolute right-0 w-56 z-20 rounded-md text-sm`}
          >
            <div>
              <div className="flex items-center justify-between pb-2">
                Cancelled
                <Switch
                  checked={filterSettings.Cancelled}
                  onChange={(checked) => handleFilters('Cancelled', checked)}
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Completed
                <Switch
                  checked={filterSettings.Completed}
                  onChange={(checked) => handleFilters('Completed', checked)}
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Defeated
                <Switch
                  checked={filterSettings.Defeated}
                  onChange={(checked) => handleFilters('Defeated', checked)}
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Draft
                <Switch
                  checked={filterSettings.Draft}
                  onChange={(checked) => handleFilters('Draft', checked)}
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Executing
                <Switch
                  checked={filterSettings.Executing}
                  onChange={(checked) => handleFilters('Executing', checked)}
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                ExecutingWithErrors
                <Switch
                  checked={filterSettings.ExecutingWithErrors}
                  onChange={(checked) =>
                    handleFilters('ExecutingWithErrors', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                SigningOff
                <Switch
                  checked={filterSettings.SigningOff}
                  onChange={(checked) => handleFilters('SigningOff', checked)}
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Succeeded
                <Switch
                  checked={filterSettings.Succeeded}
                  onChange={(checked) => handleFilters('Succeeded', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                Voting
                <Switch
                  checked={filterSettings.Voting}
                  onChange={(checked) => handleFilters('Voting', checked)}
                />
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default ProposalFilter
