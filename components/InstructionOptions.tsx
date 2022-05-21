import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { SelectorIcon } from '@heroicons/react/solid'

// Add more options as needed
export enum InstructionOptions {
  none = 'none',
  castleRefresh = 'Castle: Refresh',
  castleReconcileRefresh = 'Castle: Reconcile and Refresh',
}

export type InstructionOption = `${InstructionOptions}`

// Mapping between listbox option label and underlying option
const executionOptions: { label: string; value: InstructionOption }[] = [
  { label: 'Select Option', value: InstructionOptions.none },
  { label: 'Castle: Deposit', value: InstructionOptions.castleRefresh },
  {
    label: 'Castle: Withdraw',
    value: InstructionOptions.castleReconcileRefresh,
  },
]

export default function InstructionOptionInput(props: {
  value: InstructionOption
  setValue: (updatedValue: InstructionOption) => void
}) {
  const { value, setValue } = props

  const selectedOption = executionOptions.find((o) => o.value === value)

  return (
    <Listbox value={value} onChange={setValue}>
      <div className="relative">
        <Listbox.Button className="relative py-1 text-left border border-primary-light default-transition font-bold rounded-full px-4 text-primary-light text-sm hover:border-primary-dark hover:text-primary-dark">
          <span className="block truncate mr-3">{selectedOption?.label}</span>
          <span className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <SelectorIcon className="w-5 h-5 text-primary-light" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute text-sm bg-bkg-1 border border-gray-50  py-1 mt-1 overflow-auto text-primary-dark rounded-md shadow-lg max-h-60">
            {executionOptions.map((option, optionIdx) => (
              <Listbox.Option
                key={optionIdx}
                className={({ active }) =>
                  `cursor-default select-none relative py-2 px-4 ${
                    active
                      ? 'text-amber-900 bg-amber-100'
                      : 'text-primary-light'
                  }`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {option.label}
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
