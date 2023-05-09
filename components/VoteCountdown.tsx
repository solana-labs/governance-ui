import React, { useEffect, useState } from 'react'
import { Governance, Proposal } from '@solana/spl-governance'
import dayjs from 'dayjs'

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const ZeroCountdown: CountdownState = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
}

const isZeroCountdown = (state: CountdownState) =>
  state.days === 0 &&
  state.hours === 0 &&
  state.minutes === 0 &&
  state.seconds === 0

export function VoteCountdown({
  proposal,
  governance,
}: {
  proposal: Proposal
  governance: Governance
}) {
  const [countdown, setCountdown] = useState(ZeroCountdown)

  useEffect(() => {
    if (proposal.isVoteFinalized()) {
      setCountdown(ZeroCountdown)
      return
    }

    const getTimeToVoteEnd = () => {
      const now = dayjs().unix()

      let timeToVoteEnd = proposal.isPreVotingState()
        ? governance.config.baseVotingTime
        : (proposal.votingAt?.toNumber() ?? 0) +
          governance.config.baseVotingTime -
          now

      if (timeToVoteEnd <= 0) {
        return ZeroCountdown
      }

      const days = Math.floor(timeToVoteEnd / 86400)
      timeToVoteEnd -= days * 86400

      const hours = Math.floor(timeToVoteEnd / 3600) % 24
      timeToVoteEnd -= hours * 3600

      const minutes = Math.floor(timeToVoteEnd / 60) % 60
      timeToVoteEnd -= minutes * 60

      const seconds = Math.floor(timeToVoteEnd % 60)

      return { days, hours, minutes, seconds }
    }

    const updateCountdown = () => {
      const newState = getTimeToVoteEnd()
      setCountdown(newState)
    }

    const interval = setInterval(() => {
      updateCountdown()
    }, 1000)

    updateCountdown()
    return () => clearInterval(interval)
  }, [proposal, governance])

  return (
    <>
      {isZeroCountdown(countdown) ? (
        <div className="text-fgd-3">Voting ended</div>
      ) : (
        <div className="flex items-center text-fgd-1 w-40">
          <div className="mr-1 text-fgd-3">Ends</div>
          {countdown && countdown.days > 0 && (
            <>
              <div className="bg-bkg-1 px-1 py-0.5 rounded">
                {countdown.days}d
              </div>
              <span className="font-bold mx-0.5 text-fgd-3">:</span>
            </>
          )}
          <div className="bg-bkg-1 px-1 py-0.5 rounded">{countdown.hours}h</div>
          <span className="font-bold mx-0.5 text-fgd-3">:</span>
          <div className="bg-bkg-1 px-1 py-0.5 rounded">
            {countdown.minutes}m
          </div>
          {!countdown.days && (
            <>
              <span className="font-bold mx-0.5 text-fgd-3">:</span>
              <div className="bg-bkg-1 px-1 py-0.5 rounded w-9">
                {countdown.seconds}s
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
