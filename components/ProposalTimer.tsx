import { CaretDown, Timer } from '@carbon/icons-react'
import { Governance, Proposal } from '@solana/spl-governance'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'

/** here's a horrible function chatgpt wrote for me :-) */
function formatDuration(seconds: number) {
  const minuteInSeconds = 60
  const hourInSeconds = minuteInSeconds * 60
  const dayInSeconds = hourInSeconds * 24

  const days = Math.floor(seconds / dayInSeconds)
  seconds %= dayInSeconds
  const hours = Math.floor(seconds / hourInSeconds)
  seconds %= hourInSeconds
  const minutes = Math.floor(seconds / minuteInSeconds)

  const parts = [
    days.toString().padStart(2, '0') + 'd',
    hours.toString().padStart(2, '0') + 'h',
    minutes.toString().padStart(2, '0') + 'm',
  ] as const

  return parts
}

const useCountdown = ({
  proposal,
  governance,
}: {
  proposal: Proposal
  governance: Governance
}) => {
  const [countdown, setCountdown] = useState<
    ReturnType<typeof getTimeToVoteEnd> | undefined
  >(undefined)

  const getTimeToVoteEnd = useCallback(() => {
    // todo this should probably be made impossible if its not already
    if (proposal.isVoteFinalized()) {
      return { state: 'done' } as const
    }

    const now = dayjs().unix() // TODO remove superfluous dependency
    const votingStartedAt = proposal.votingAt?.toNumber() ?? 0 // TODO when and why would this be null ?

    const totalSecondsElapsed = Math.max(0, now - votingStartedAt)
    const maxVotingTime =
      governance.config.baseVotingTime + governance.config.votingCoolOffTime

    const totalSecondsRemaining = Math.max(
      0,
      maxVotingTime - totalSecondsElapsed
    )
    if (totalSecondsRemaining <= 0) {
      return { state: 'done' } as const
    }

    return {
      state: 'voting',
      total: {
        secondsRemaining: totalSecondsRemaining,
        secondsElapsed: totalSecondsElapsed,
      },
    } as const
  }, [
    governance.config.baseVotingTime,
    governance.config.votingCoolOffTime,
    proposal,
  ])

  useEffect(() => {
    const updateCountdown = () => {
      const newState = getTimeToVoteEnd()
      setCountdown(newState)
    }

    const interval = setInterval(() => {
      updateCountdown()
    }, 1000)

    updateCountdown()
    return () => clearInterval(interval)
  }, [getTimeToVoteEnd])

  return countdown
}

const ProposalTimer = ({
  proposal,
  governance,
}: {
  proposal: Proposal
  governance: Governance
}) => {
  const countdown = useCountdown({ proposal, governance })

  return countdown && countdown.state === 'voting' ? (
    <>
      <div className="min-w-[115px] bg-neutral-900 rounded-md py-1 px-2 flex flex-col">
        <div className="text-white flex justify-between items-center mb-1 gap-3 flex-nowrap">
          <Timer />
          <div className="flex gap-2">
            {formatDuration(countdown.total.secondsRemaining).map((x, i) => (
              <div key={i}>{x}</div>
            ))}
          </div>
        </div>
        <div /** The colored bar */ className="flex h-[1.5px]">
          <div
            /** Unrestricted voting time elapsed */ style={{
              flex: Math.min(
                countdown.total.secondsElapsed,
                governance.config.baseVotingTime
              ),
            }}
            className="bg-sky-900"
          />
          <Notch
            /** White notch (unrestricted voting time) */ className={
              countdown.total.secondsElapsed > governance.config.baseVotingTime
                ? 'hidden'
                : undefined
            }
          />
          <div
            /** Unrestricted voting time remaining */ style={{
              flex: Math.max(
                0,
                governance.config.baseVotingTime -
                  countdown.total.secondsElapsed
              ),
            }}
            className="bg-sky-500"
          />
          <div className="w-[1px]" />
          <div
            /** Cooloff time elapsed */ style={{
              flex: Math.min(
                countdown.total.secondsElapsed -
                  governance.config.baseVotingTime,
                governance.config.baseVotingTime +
                  governance.config.votingCoolOffTime
              ),
            }}
            className="bg-[#665425]"
          />
          <Notch
            /** White notch (cooloff) */
            className={
              countdown.total.secondsElapsed <= governance.config.baseVotingTime
                ? 'hidden'
                : undefined
            }
          />

          <div
            /** Cooloff time remaining */ style={{
              flex: Math.max(
                0,
                governance.config.votingCoolOffTime -
                  Math.max(
                    0,
                    countdown.total.secondsElapsed -
                      governance.config.baseVotingTime
                  )
              ),
            }}
            className="bg-amber-500"
          />
        </div>
      </div>
    </>
  ) : null
}

const Notch = ({ className }: { className?: string }) => (
  <div className={clsx(className, 'relative w-[1px] bg-white')}>
    <CaretDown
      size={20}
      className="absolute text-white left-1/2 -translate-x-1/2 top-[-13px] scale-50"
    />
  </div>
)

export default ProposalTimer
