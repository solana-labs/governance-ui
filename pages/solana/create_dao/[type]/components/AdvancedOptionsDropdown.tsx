import { Disclosure } from '@headlessui/react'

export default function AdvancedOptionsDropdown({ children }) {
  return (
    <div className="py-8 md:py-12">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="font-light">
              <div className="flex items-center py-2 pl-4 pr-2 space-x-2 rounded-full w-fit hover:bg-white/10">
                <div className="mb-0 font-sans text-lg text-left">
                  Advanced Options
                </div>
                <img
                  src="/img/realms-web/icons/chevron.svg"
                  className={`h-7 default-transition bg-white/20 rounded-full px-2 w-7 ${
                    open ? 'transform rotate-180' : ''
                  }`}
                />
              </div>
              <div
                className={`${
                  open ? 'visible' : 'invisible'
                } pt-3 text-white/50`}
              >
                Advanced creators may adjust certain aspects of their DAOs.
              </div>
            </Disclosure.Button>
            {/* <Transition
              enter="transform transition duration-[300ms]"
              enterFrom="opacity-0 h-0"
              enterTo="opacity-100 h-fit"
              leave="transform duration-300 transition ease-in-out"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            > */}
            <Disclosure.Panel className="pt-20">{children}</Disclosure.Panel>
            {/* </Transition> */}
          </>
        )}
      </Disclosure>
    </div>
  )
}
