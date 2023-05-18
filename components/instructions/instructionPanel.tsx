import useProposal from '../../hooks/useProposal'
import InstructionCard from './instructionCard'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useEffect, useRef, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { InstructionExecutionStatus, RpcContext } from '@solana/spl-governance'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import {
  ExecuteAllInstructionButton,
  PlayState,
} from './ExecuteAllInstructionButton'
import Button from '@components/Button'
import { dryRunInstruction } from 'actions/dryRunInstruction'
import { getExplorerInspectorUrl } from '@components/explorer/tools'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRouteProposalQuery } from '@hooks/queries/proposal'

export function InstructionPanel() {
  const proposal = useRouteProposalQuery().data?.result
  const { instructions } = useProposal()
  const { realmInfo } = useRealm()
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection)

  const [currentSlot, setCurrentSlot] = useState(0)

  const canExecuteAt = proposal?.account.votingCompletedAt
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [ineligibleToSee, connection, currentSlot])

  if (Object.values(instructions).length === 0) {
    return null
  }

  const proposalInstructions = Object.values(instructions).sort(
    (i1, i2) => i1.account.instructionIndex - i2.account.instructionIndex
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [playing, setPlaying] = useState(
    proposalInstructions.every((x) => x.account.executedAt)
      ? PlayState.Played
      : PlayState.Unplayed
  )

  const simulate = async () => {
    const result = await dryRunInstruction(
      connection.current,
      wallet!,
      null,
      [],
      proposalInstructions.map((x) => x.account.getSingleInstruction())
    )

    const inspectUrl = await getExplorerInspectorUrl(
      connection,
      result.transaction
    )
    window.open(inspectUrl, '_blank')
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
              {proposalInstructions.map((pi, idx) => (
                <div key={pi.pubkey.toBase58()}>
                  {proposal && (
                    <InstructionCard
                      proposal={proposal}
                      index={idx + 1}
                      proposalInstruction={pi}
                    />
                  )}
                </div>
              ))}

              {proposal && proposalInstructions.length > 1 && (
                <div className="flex justify-end space-x-4">
                  {proposalInstructions.filter((x) => !x.account.executedAt)
                    .length !== 0 && (
                    <Button onClick={simulate}>Inspect all</Button>
                  )}
                  <ExecuteAllInstructionButton
                    proposal={proposal}
                    proposalInstructions={proposalInstructions.filter(
                      (x) =>
                        x.account.executionStatus ===
                        InstructionExecutionStatus.None
                    )}
                    playing={playing}
                    setPlaying={setPlaying}
                    label="Execute in separated transactions"
                    multiTransactionMode={true}
                  />
                  <ExecuteAllInstructionButton
                    proposal={proposal}
                    proposalInstructions={proposalInstructions}
                    playing={playing}
                    setPlaying={setPlaying}
                  />
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
