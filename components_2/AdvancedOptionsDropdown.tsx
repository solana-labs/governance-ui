import { Disclosure } from '@headlessui/react'
import Button from './ProductButtons'
import Text from './ProductText'

export default function AdvancedOptionsDropdown({
  className = 'md:pt-10 w-fit',
  children,
}) {
  return (
    <div className={className}>
      <Disclosure>
        <Disclosure.Button as="div">
          {({ open }) => (
            <>
              <Button
                radio
                selected={open}
                className="flex items-center justify-center space-x-2 h-fit"
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

              <Text
                level="2"
                className={`${
                  open ? 'visible' : 'invisible'
                } pt-3 text-white/60`}
              >
                Advanced creators may adjust certain aspects of their DAOs.
              </Text>
            </>
          )}
        </Disclosure.Button>
        {/* <Transition
              enter="transform transition duration-[300ms]"
              enterFrom="opacity-0 h-0"
              enterTo="opacity-100 h-fit"
              leave="transform duration-300 transition ease-in-out"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            > */}
        <Disclosure.Panel className="pt-10">{children}</Disclosure.Panel>
        {/* </Transition> */}
      </Disclosure>
    </div>
  )
}
