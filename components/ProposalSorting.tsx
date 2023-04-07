import { ChevronDownIcon } from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import classNames from 'classnames'
import { ArrowDown, ArrowsVertical, ArrowUp } from '@carbon/icons-react'
import styled from '@emotion/styled'

export const PROPOSAL_SORTING_LOCAL_STORAGE_KEY = 'PROPOSALS_SORTING_OPT_V2'

export enum SORTING_OPTIONS {
  ASC,
  DESC,
  NONE,
}

export type Sorting = {
  completed_at: SORTING_OPTIONS
  signedOffAt: SORTING_OPTIONS
}

export const InitialSorting = {
  completed_at: SORTING_OPTIONS.NONE,
  signedOffAt: SORTING_OPTIONS.NONE,
}

const keyToLabel = {
  completed_at: 'Voting completed',
  signedOffAt: 'Signing time',
}

const StyledAlertCount = styled.span`
  font-size: 0.6rem;
`

interface Props {
  className?: string
  disabled?: boolean
  sorting: Sorting
  onChange(newSorting: Sorting): void
}

const ProposalSorting = ({ className, disabled, onChange, sorting }: Props) => {
  const hiddenCount = Object.values(sorting).filter(
    (x) => x !== SORTING_OPTIONS.NONE
  ).length
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
              Sorting
              <ChevronDownIcon
                className={`default-transition h-5 w-5 ml-1 text-fgd-2 ${
                  open ? 'transform rotate-180' : 'transform rotate-360'
                }`}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={`bg-bkg-1 border border-fgd-4 mt-2 p-4 absolute right-0 w-56 z-20 rounded-md text-xs space-y-2`}
          >
            {Object.keys(InitialSorting).map((x) => (
              <Option
                sorting={sorting}
                objKey={x}
                key={x}
                onChange={onChange}
                label={keyToLabel[x]}
              ></Option>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

const Option = ({ sorting, objKey, onChange, label }) => {
  return (
    <div className="flex">
      {label}
      <div className="ml-auto cursor-pointer">
        {sorting[objKey] === SORTING_OPTIONS.NONE && (
          <ArrowsVertical
            onClick={() =>
              onChange({
                ...sorting,
                [objKey]: SORTING_OPTIONS.DESC,
              })
            }
          ></ArrowsVertical>
        )}
        {sorting[objKey] === SORTING_OPTIONS.DESC && (
          <ArrowDown
            onClick={() =>
              onChange({
                ...sorting,
                [objKey]: SORTING_OPTIONS.ASC,
              })
            }
          ></ArrowDown>
        )}
        {sorting[objKey] === SORTING_OPTIONS.ASC && (
          <ArrowUp
            onClick={() =>
              onChange({
                ...sorting,
                [objKey]: SORTING_OPTIONS.NONE,
              })
            }
          ></ArrowUp>
        )}
      </div>
    </div>
  )
}

export default ProposalSorting
