import useProposal from '../../hooks/useProposal'
import InstructionCard from './instructionCard'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useEffect, useRef, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { RpcContext } from '@solana/spl-governance'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'

export function InstructionPanel() {
  const { instructions, proposal } = useProposal()
  const { realmInfo } = useRealm()
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const [currentSlot, setCurrentSlot] = useState(0)

  const canExecuteAt = proposal!.account.votingCompletedAt
    ? proposal!.account.votingCompletedAt.toNumber() + 1
    : 0

  const ineligibleToSee = currentSlot - canExecuteAt >= 0

  useEffect(() => {
    if (ineligibleToSee && proposal) {
      const rpcContext = new RpcContext(
        proposal?.owner,
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )

      const timer = setTimeout(() => {
        rpcContext.connection
          .getSlot()
          .then((resp) => (mounted.current ? setCurrentSlot(resp) : null))
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [ineligibleToSee, connection, currentSlot])

  if (Object.values(instructions).length === 0) {
    return null
  }

  return (
    <div>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              className={`border border-fgd-4 font-bold px-4 md:px-6 py-4 text-fgd-1 rounded-lg transition-all w-full hover:bg-bkg-3 focus:outline-none ${
                open && 'rounded-b-none'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="mb-0">Instructions</h2>
                <ChevronDownIcon
                  className={`h-6 text-primary-light transition-all w-6 ${
                    open ? 'transform rotate-180' : 'transform rotate-360'
                  }`}
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel
              className={`border border-fgd-4 border-t-0 p-4 md:p-6 pt-0 rounded-b-md`}
            >
              {Object.values(instructions)
                .sort(
                  (i1, i2) =>
                    i1.account.instructionIndex - i2.account.instructionIndex
                )
                .map((pi, idx) => (
                  <div key={pi.pubkey.toBase58()}>
                    {proposal && (
                      <InstructionCard
                        proposal={proposal}
                        index={idx + 1}
                        proposalInstruction={pi}
                      ></InstructionCard>
                    )}
                  </div>
                ))}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
