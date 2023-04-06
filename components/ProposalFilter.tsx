import styled from '@emotion/styled'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import Switch from './Switch'
import classNames from 'classnames'
import Button from './Button'

export const InitialFilters = {
  Cancelled: false,
  Completed: true,
  Defeated: true,
  Draft: false,
  Executable: true,
  ExecutingWithErrors: true,
  SigningOff: true,
  Voting: true,
  Vetoed: true,
  withoutQuorum: false,
}

export type Filters = typeof InitialFilters

function getFilterLabel(filter: keyof Filters) {
  switch (filter) {
    case 'ExecutingWithErrors':
      return 'Executing w/ errors'
    case 'withoutQuorum':
      return 'Voting without quorum'
    default:
      return filter
  }
}

const StyledAlertCount = styled.span`
  font-size: 0.6rem;
`

interface Props {
  className?: string
  disabled?: boolean
  filters: Filters
  onChange(newFilters: Filters): void
}

const ProposalFilter = ({ className, disabled, filters, onChange }: Props) => {
  const hiddenCount = Object.values(filters).reduce((acc, cur) => {
    if (!cur) {
      return acc + 1
    }

    return acc
  }, 0)

  return (
    <Disclosure as="div" className={classNames('relative', className)}>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`border border-fgd-3 default-transition font-normal h-10 pl-3 pr-2 rounded-md text-fgd-1 text-sm hover:bg-bkg-3 focus:outline-none disabled:cursor-not-allowed disabled:hover:bg-bkg-2 disabled:opacity-60`}
            disabled={disabled}
          >
            {hiddenCount > 0 ? (
              <div className="absolute -top-3 -right-1.5 z-20">
                <StyledAlertCount className="w-4 h-4 bg-red text-white relative inline-flex rounded-full flex items-center justify-center">
                  {hiddenCount}
                </StyledAlertCount>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              Filter
              <ChevronDownIcon
                className={`default-transition h-5 w-5 ml-1 text-fgd-2 ${
                  open ? 'transform rotate-180' : 'transform rotate-360'
                }`}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={`bg-bkg-1 border border-fgd-4 mt-2 p-4 absolute right-0 w-56 z-20 rounded-md text-xs`}
          >
            <div>
              {Object.entries(filters).map(
                ([filterName, filterValue]: [keyof Filters, boolean]) => (
                  <div
                    className="flex items-center justify-between pb-2"
                    key={filterName}
                  >
                    {getFilterLabel(filterName)}
                    <Switch
                      checked={filterValue}
                      onChange={(checked) =>
                        onChange({ ...filters, [filterName]: checked })
                      }
                    />
                  </div>
                )
              )}
            </div>
            <Button
              onClick={() => {
                const newFilters = {
                  ...Object.keys(InitialFilters).reduce(
                    (reduced, key) => ({ ...reduced, [key]: false }),
                    {}
                  ),
                }
                onChange({ ...(newFilters as any) })
              }}
              className="float-right mt-3"
              small={true}
            >
              Deselect all
            </Button>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default ProposalFilter
