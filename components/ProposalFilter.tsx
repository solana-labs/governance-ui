import { useEffect, useReducer } from 'react'
import styled from '@emotion/styled'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import Switch from './Switch'
import { ProposalState } from '@solana/spl-governance'

const initialFilterSettings = {
  [ProposalState.Draft]: false,
  [ProposalState.SigningOff]: true,
  [ProposalState.Voting]: true,
  [ProposalState.Succeeded]: true,
  [ProposalState.Executing]: true,
  [ProposalState.Completed]: true,
  [ProposalState.Cancelled]: false,
  [ProposalState.Defeated]: true,
  [ProposalState.ExecutingWithErrors]: true,
}

const StyledAlertCount = styled.span`
  font-size: 0.6rem;
`

const ProposalFilter = ({ filters, setFilters }) => {
  const [filterSettings, setFilterSettings] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialFilterSettings
  )

  const handleFilters = (proposalState, checked) => {
    setFilterSettings({ [proposalState]: checked })
    if (!checked) {
      setFilters([...filters, proposalState])
    } else {
      setFilters(filters.filter((n) => n !== proposalState))
    }
  }

  useEffect(() => {
    const initialFilters = Object.keys(initialFilterSettings)
      .filter((x) => !initialFilterSettings[x])
      .map(Number)

    setFilters([...initialFilters])
  }, [])
  return (
    <Disclosure as="div" className="relative">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`default-transition font-normal pl-3 pr-2 py-2.5 ring-1 ring-fgd-3 rounded-md text-fgd-1 text-sm hover:bg-bkg-3 focus:outline-none`}
          >
            {filters.length > 0 ? (
              <div className="absolute -top-3 -right-1.5 z-20">
                <StyledAlertCount className="w-4 h-4 bg-red relative inline-flex rounded-full flex items-center justify-center">
                  {filters.length}
                </StyledAlertCount>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              Filter
              <ChevronDownIcon
                className={`default-transition h-5 w-5 ml-1 text-primary-light ${
                  open ? 'transform rotate-180' : 'transform rotate-360'
                }`}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={`bg-bkg-1 border border-fgd-4 mt-2 p-4 absolute right-0 w-56 z-20 rounded-md text-xs`}
          >
            <div>
              <div className="flex items-center justify-between pb-2">
                Cancelled
                <Switch
                  checked={filterSettings[ProposalState.Cancelled]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.Cancelled, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Completed
                <Switch
                  checked={filterSettings[ProposalState.Completed]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.Completed, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Defeated
                <Switch
                  checked={filterSettings[ProposalState.Defeated]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.Defeated, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Draft
                <Switch
                  checked={filterSettings[ProposalState.Draft]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.Draft, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Executing
                <Switch
                  checked={filterSettings[ProposalState.Executing]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.Executing, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                ExecutingWithErrors
                <Switch
                  checked={filterSettings[ProposalState.ExecutingWithErrors]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.ExecutingWithErrors, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                SigningOff
                <Switch
                  checked={filterSettings[ProposalState.SigningOff]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.SigningOff, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                Succeeded
                <Switch
                  checked={filterSettings[ProposalState.Succeeded]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.Succeeded, checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                Voting
                <Switch
                  checked={filterSettings[ProposalState.Voting]}
                  onChange={(checked) =>
                    handleFilters(ProposalState.Voting, checked)
                  }
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
