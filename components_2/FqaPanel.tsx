import { Disclosure } from '@headlessui/react'

export const FqaPanel = ({ question, answer }) => {
  return (
    <div className="my-12">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="w-full pr-4">
              <div className="flex items-center justify-between">
                <h3 className="mb-0">{question}</h3>
                <img
                  src="/img/realms-web/icons/chevron.svg"
                  className={`h-6 ml-5 transition-all w-4 ${
                    open ? 'transform rotate-360' : 'transform rotate-180'
                  }`}
                />
              </div>
            </Disclosure.Button>

            <Disclosure.Panel>
              <p className="pt-2 opacity-70 md:pr-20">{answer}</p>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
