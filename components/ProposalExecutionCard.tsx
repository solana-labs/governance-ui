import classNames from 'classnames'
import { useEffect, useState, useRef } from 'react'
import dayjs from 'dayjs'
import { LockClosedIcon } from '@heroicons/react/outline'

import {
  ExecuteAllInstructionButton,
  PlayState,
} from '@components/instructions/ExecuteAllInstructionButton'
import { ntext } from '@utils/ntext'
import Button from '@components/Button'
import { diffTime } from '@components/ProposalRemainingVotingTime'
import useProposalTransactions from '@hooks/useProposalTransactions'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useSelectedProposalTransactions } from '@hooks/queries/proposalTransaction'

interface Props {
  className?: string
}

export default function ProposalExecutionCard(props: Props) {
  const proposal = useRouteProposalQuery().data?.result
  const { data: allTransactions } = useSelectedProposalTransactions()
  const [playState, setPlayState] = useState(PlayState.Unplayed)
  const [timeLeft, setTimeLeft] = useState<
    undefined | ReturnType<typeof diffTime>
  >()
  const timer = useRef<undefined | number>()

  const proposalTransactions = useProposalTransactions(
    allTransactions,
    proposal
  )

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      proposalTransactions &&
      proposalTransactions.nextExecuteAt
    ) {
      timer.current = window.setInterval(() => {
        const end = dayjs(1000 * proposalTransactions.nextExecuteAt!)
        setTimeLeft(diffTime(false, dayjs(), end))
      }, 1000)
    }

    return () => clearInterval(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [proposalTransactions?.nextExecuteAt])

  if (
    allTransactions === undefined ||
    allTransactions.length === 0 ||
    !proposal ||
    !proposalTransactions ||
    allTransactions.length === proposalTransactions.executed.length
  ) {
    return null
  }

  const { ready, notReady, executed, nextExecuteAt } = proposalTransactions

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
          {nextExecuteAt !== null
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
              multiTransactionMode={true}
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
