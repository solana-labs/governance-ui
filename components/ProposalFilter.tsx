import { useState, useReducer } from 'react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import Switch from './Switch'

const initialFilterSettings = {
  Active: true,
  Approved: true,
  Denied: true,
}

const ProposalFilter = () => {
  const [filters, setFilters] = useState([])

  const [filterSettings, setFilterSettings] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialFilterSettings
  )

  const handleFilters = (name, checked) => {
    setFilterSettings({ [name]: checked })
    if (!checked) {
      filters.push(name)
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
                Active
                <Switch
                  checked={filterSettings.Active}
                  onChange={(checked) => handleFilters('Active', checked)}
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Approved
                <Switch
                  checked={filterSettings.Approved}
                  onChange={(checked) => handleFilters('Approved', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                Denied
                <Switch
                  checked={filterSettings.Denied}
                  onChange={(checked) => handleFilters('Denied', checked)}
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
