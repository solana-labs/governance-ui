import { useState } from 'react'
import { Transition } from '@headlessui/react'
import { NewButton as Button } from '@components/Button'
import Text from '@components/Text'

export default function AdvancedOptionsDropdown({
  className = 'mt-10 md:mt-16 w-fit',
  children,
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={className}>
      <Button
        radio
        selected={open}
        className="flex items-center justify-center space-x-2 h-fit"
        onClick={() => setOpen(!open)}
      >
        <Text level="2" className="font-normal">
          Advanced Options
        </Text>
        <div
          className={`default-transition text-white ${
            open ? 'text-black transform rotate-180' : ''
          }`}
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
      </Button>
      <Transition
        show={open}
        enter="transform transition duration-[400ms]"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transform duration-200 transition ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pl-2">
          <Text level="2" className="pt-4 pb-10 text-white/60">
            Advanced creators may adjust certain aspects of their DAOs.
          </Text>
          {children}
        </div>
      </Transition>
    </div>
  )
}
