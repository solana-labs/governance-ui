import TransactionCard from './TransactionCard'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useSelectedProposalTransactions } from '@hooks/queries/proposalTransaction'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export function TransactionPanel() {
  const proposal = useRouteProposalQuery().data?.result
  const { data: transactions } = useSelectedProposalTransactions()

  const { realmInfo } = useRealm()
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()

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
  }, [ineligibleToSee, connection, currentSlot, proposal, realmInfo, wallet])

  const proposalTransactions = useMemo(
    () =>
      (transactions ?? []).sort(
        (i1, i2) => i1.account.instructionIndex - i2.account.instructionIndex
      ),
    [transactions]
  )
  const [playing, setPlaying] = useState(PlayState.Unplayed)

  useEffect(() => {
    setPlaying(
      proposalTransactions.every((x) => x.account.executedAt)
        ? PlayState.Played
        : PlayState.Unplayed
    )
  }, [proposalTransactions])

  const simulate = async () => {
    const result = await dryRunInstruction(
      connection.current,
      wallet!,
      null,
      [],
      [...proposalTransactions.flatMap((x) => x.account.getAllInstructions())]
    )

    const inspectUrl = await getExplorerInspectorUrl(
      connection,
      result.transaction
    )
    window.open(inspectUrl, '_blank')
  }

  if (transactions?.length === 0) {
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
              {proposalTransactions.map((pi, idx) => (
                <div key={pi.pubkey.toBase58()}>
                  {proposal && (
                    <TransactionCard
                      proposal={proposal}
                      index={idx + 1}
                      proposalTransaction={pi}
                    />
                  )}
                </div>
              ))}

              {proposal && proposalTransactions.length > 1 && (
                <div className="flex justify-end space-x-4">
                  {proposalTransactions.filter((x) => !x.account.executedAt)
                    .length !== 0 && (
                    <Button onClick={simulate}>Inspect all</Button>
                  )}
                  <ExecuteAllInstructionButton
                    proposal={proposal}
                    proposalInstructions={proposalTransactions.filter(
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
                    proposalInstructions={proposalTransactions}
                    playing={playing}
                    label="Execute all in one transaction"
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
