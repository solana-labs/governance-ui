import React from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { InformationCircleIcon } from '@heroicons/react/outline'
import Loading from '@components/Loading'
import Tooltip from './Tooltip'

interface DropdownOption {
  label: string
  disabled?: boolean
  disabledTooltip?: string
  onClick: () => Promise<void>
}

interface DropdownBtnProps {
  className: string
  label?: string
  options: DropdownOption[]
  isLoading?: boolean
  disabled?: boolean
}

const DropdownBtn: React.FC<DropdownBtnProps> = ({
  className,
  label = 'Options',
  options,
  isLoading = false,
  disabled = false,
}) => {
  const basicClasses = `inline-flex rounded-full w-full justify-center bg-primary-light text-bkg-2 px-4 py-3 text-sm font-medium`
  const hoverClasses = `hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 hover:bg-fgd-1`
  const disabledClasses = disabled
    ? `!bg-fgd-4 !cursor-not-allowed !text-fgd-3`
    : ''
  const btnClasses = `${basicClasses} ${hoverClasses} ${disabledClasses}`

  return (
    <Menu as="div" className={`${className} relative inline-block text-left`}>
      {({ open }) => (
        <>
          <Menu.Button className={`${btnClasses}`}>
            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div className="font-bold">{label}</div>
                <ChevronDownIcon
                  className="ml-2 -mr-1 h-5 w-5"
                  aria-hidden="true"
                />
              </>
            )}
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            {!disabled && open && (
              <Menu.Items
                className="absolute right-0 mt-2 w-full origin-top-right divide-y divide-gray-100 rounded-md bg-bkg-3 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                static
              >
                <div className="px-1 py-1 ">
                  {options.map((option, idx) => (
                    <Menu.Item key={`option-${idx}`} disabled={option.disabled}>
                      {({ active, disabled }) => (
                        <button
                          onClick={option.onClick}
                          className={`${
                            active
                              ? 'bg-primary-light text-fgd-1'
                              : 'text-fgd-2'
                          } 
                          ${
                            disabled ? `cursor-not-allowed !text-fgd-4` : ''
                          } group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm`}
                        >
                          {option.label}
                          {disabled && option.disabledTooltip && (
                            <Tooltip content={option.disabledTooltip}>
                              <InformationCircleIcon className="h-5" />
                            </Tooltip>
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            )}
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default DropdownBtn
