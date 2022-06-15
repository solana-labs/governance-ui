import { useState } from 'react'
import { Transition } from '@headlessui/react'
import Text from '@components/Text'

export default function AdvancedOptionsDropdown({
  className = 'mt-10 md:mt-16 w-fit',
  children,
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={className}>
      <button
        type="button"
        className={`flex items-center justify-center px-4 py-2 space-x-2 rounded-full h-fit border ${
          open ? 'bg-bkg-2' : 'text-fgd-2'
        } border-fgd-4 hover:border-fgd-1 hover:bg-bkg-3 hover:text-fgd-1 focus:border-fgd-2 disabled:cursor-not-allowed`}
        onClick={() => setOpen(!open)}
      >
        <Text level="2" className="font-normal">
          Advanced Options
        </Text>
        <div
          className={`default-transition ${open ? 'transform rotate-180' : ''}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.99992 9.5858L12.2928 5.29291L13.707 6.70712L7.99992 12.4142L2.29282 6.70712L3.70703 5.29291L7.99992 9.5858Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </button>
      <Transition
        show={open}
        enter="transform transition duration-[400ms]"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transform duration-200 transition ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pt-10">{children}</div>
      </Transition>
    </div>
  )
}
