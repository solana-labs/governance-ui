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
            className={`bg-bkg-2 border border-bkg-3 font-bold px-6 py-4 text-fgd-1 rounded-lg transition-all w-full hover:bg-bkg-3 focus:outline-none ${
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
            className={`bg-bkg-2 border border-bkg-3 border-t-0 p-6 pt-0 rounded-b-md`}
          >
            {Object.values(instructions)
              .sort(
                (i1, i2) => i1.info.instructionIndex - i2.info.instructionIndex
              )
              .map((pi, idx) => (
                <div className="pt-6" key={pi.pubkey.toBase58()}>
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
