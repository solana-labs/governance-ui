import useProposal from '../../hooks/useProposal'
import InstructionCard from './instructionCard'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'

export function InstructionPanel() {
  const { instructions } = useProposal()

  if (Object.values(instructions).length === 0) {
    return null
  }

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`bg-bkg-2 font-bold px-6 py-4 text-fgd-1 rounded-md transition-all w-full hover:bg-bkg-3 focus:outline-none ${
              open && 'rounded-b-none'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="mb-0">Instructions</h2>
              <ChevronDownIcon
                className={`h-5 text-primary-light transition-all w-5 ${
                  open ? 'transform rotate-180' : 'transform rotate-360'
                }`}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={`bg-bkg-2 border-t border-bkg-4 p-6 rounded-b-md`}
          >
            {Object.values(instructions).map((pi, idx) => (
              <div key={pi.pubkey.toBase58()}>
                <InstructionCard
                  index={idx + 1}
                  proposalInstruction={pi.info}
                ></InstructionCard>
              </div>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
