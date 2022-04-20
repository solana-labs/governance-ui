import { Disclosure } from '@headlessui/react'
// import Chevron from './Chevron'

export function FqaPanel() {
  return (
    <div>
      <div className="my-12">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full pr-4">
                <div className="flex items-center justify-between">
                  <h3 className="mb-0">
                    I still don’t understand DAOs. Can you explain again?
                  </h3>
                  <img
                    src="/img/realms-web/icons/chevron.svg"
                    className={`h-6 ml-5 transition-all w-4 ${
                      open ? 'transform rotate-360' : 'transform rotate-180'
                    }`}
                  />
                </div>
              </Disclosure.Button>

              <Disclosure.Panel>
                <p className="pt-2 md:pr-20">
                  Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
      <hr className="border-fgd-4" />
      <div className="my-12">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full pr-4">
                <div className="flex items-center justify-between">
                  <h3>Who can start a DAO?</h3>
                  <img
                    src="/img/realms-web/icons/chevron.svg"
                    className={`h-6 ml-5 transition-all w-4 ${
                      open ? 'transform rotate-360' : 'transform rotate-180'
                    }`}
                  />
                </div>
              </Disclosure.Button>

              <Disclosure.Panel>
                <p className="pt-2 md:pr-20">
                  Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
      <hr className="border-fgd-4" />
      <div className="my-12">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full pr-4">
                <div className="flex items-center justify-between">
                  <h3>Why should I use Solana for my DAO</h3>
                  <img
                    src="/img/realms-web/icons/chevron.svg"
                    className={`h-6 ml-5 transition-all w-4 ${
                      open ? 'transform rotate-360' : 'transform rotate-180'
                    }`}
                  />
                </div>
              </Disclosure.Button>

              <Disclosure.Panel>
                <p className="pt-2 md:pr-20">
                  Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
      <hr className="border-fgd-4" />
      <div className="my-12">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full pr-4">
                <div className="flex items-center justify-between">
                  <h3>What is SPL-Governance?</h3>
                  <img
                    src="/img/realms-web/icons/chevron.svg"
                    className={`h-6 ml-5 transition-all w-4 ${
                      open ? 'transform rotate-360' : 'transform rotate-180'
                    }`}
                  />
                </div>
              </Disclosure.Button>

              <Disclosure.Panel>
                <p className="pt-2 md:pr-20">
                  Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
      <hr className="border-fgd-4" />
      <div className="my-12">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full pr-4">
                <div className="flex items-center justify-between">
                  <h3>What is the environmental impact of running a DAO?</h3>
                  <img
                    src="/img/realms-web/icons/chevron.svg"
                    className={`h-6 ml-5 transition-all w-4 ${
                      open ? 'transform rotate-360' : 'transform rotate-180'
                    }`}
                  />
                </div>
              </Disclosure.Button>

              <Disclosure.Panel>
                <p className="pt-2 md:pr-20">
                  Lorem ipsum on how DAOs on Realms works. Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt. Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  )
}
