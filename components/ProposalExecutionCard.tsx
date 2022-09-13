import { ProgramAccount, ProposalTransaction } from '@solana/spl-governance'
import classNames from 'classnames'
import { useEffect, useState, useRef } from 'react'
import dayjs from 'dayjs'
import { LockClosedIcon } from '@heroicons/react/outline'

import {
  ExecuteAllInstructionButton,
  PlayState,
} from '@components/instructions/ExecuteAllInstructionButton'
import useProposal from '@hooks/useProposal'
import { ntext } from '@utils/ntext'
import Button from '@components/Button'
import { diffTime } from '@components/ProposalRemainingVotingTime'

function parseTransactions(
  transactions: ProgramAccount<ProposalTransaction>[]
) {
  const executed: ProgramAccount<ProposalTransaction>[] = []
  const ready: ProgramAccount<ProposalTransaction>[] = []
  const notReady: ProgramAccount<ProposalTransaction>[] = []
  let minHoldUpTime: number | null = null

  for (const transaction of transactions) {
    const holdUpTime = transaction.account.holdUpTime

    if (transaction.account.executedAt) {
      executed.push(transaction)
    } else if (!holdUpTime || holdUpTime <= 0) {
      ready.push(transaction)
    } else {
      notReady.push(transaction)

      if (holdUpTime) {
        if (minHoldUpTime === null || holdUpTime < minHoldUpTime) {
          minHoldUpTime = holdUpTime
        }
      }
    }
  }

  // Order instructions by instruction index
  return {
    executed,
    ready: ready.sort(
      (a, b) => a.account.instructionIndex - b.account.instructionIndex
    ),
    notReady,
    minHoldUpTime,
  }
}

interface Props {
  className?: string
}

export default function ProposalExecutionCard(props: Props) {
  const { instructions, proposal } = useProposal()
  const [playState, setPlayState] = useState(PlayState.Unplayed)
  const [timeLeft, setTimeLeft] = useState<
    undefined | ReturnType<typeof diffTime>
  >()
  const timer = useRef<undefined | number>()

  const allTransactions = Object.values(instructions)
  const { executed, ready, notReady, minHoldUpTime } = parseTransactions(
    allTransactions
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && minHoldUpTime) {
      timer.current = window.setInterval(() => {
        const end = dayjs(1000 * (dayjs().unix() + minHoldUpTime))
        setTimeLeft(diffTime(false, dayjs(), end))
      }, 1000)
    }

    return () => clearInterval(timer.current)
  }, [minHoldUpTime])

  if (
    allTransactions.length === 0 ||
    !proposal ||
    allTransactions.length === executed.length
  ) {
    return null
  }

  return (
    <div
      className={classNames(
        props.className,
        'bg-bkg-2',
        'p-4',
        'rounded-lg',
        'md:p-6'
      )}
    >
      <div className="flex items-center flex-col">
        <h3 className="mb-0">
          {minHoldUpTime !== null
            ? 'Execution Hold Up Time'
            : 'Execute Proposal'}
        </h3>
        {!!executed.length && !ready.length && (
          <div className="text-xs text-white/50">
            {executed.length} {ntext(executed.length, 'transaction')} executed
          </div>
        )}
        {!!(executed.length && ready.length) && (
          <div className="text-xs text-white/50">
            {ready.length} {ntext(ready.length, 'transaction')} ready (
            {executed.length} executed)
          </div>
        )}
        <div className="mt-4">
          {ready.length ? (
            <ExecuteAllInstructionButton
              className="w-48"
              proposal={proposal}
              playing={playState}
              setPlaying={setPlayState}
              small={false}
              proposalInstructions={ready}
            />
          ) : (
            <Button className="w-48" disabled>
              Execute
            </Button>
          )}
        </div>
        {!!notReady.length && (
          <div className="mt-4 text-xs text-white/50">
            {notReady.length} {ntext(notReady.length, 'transaction')} remaining
          </div>
        )}
        {timeLeft && (
          <div className="bg-black rounded-full h-10 w-48 px-8 flex flex-row items-center justify-center mt-2 text-xs text-white">
            <LockClosedIcon className="h-3 w-3 mr-3" />
            {timeLeft.days}d &nbsp; : &nbsp;
            {timeLeft.hours}h &nbsp; : &nbsp;
            {timeLeft.minutes}m
          </div>
        )}
      </div>
    </div>
  )
}
