import React from 'react'
import useWalletStore from 'stores/useWalletStore'
import { useVotingPop } from './VotePanel/hooks'
import { UserGroupIcon } from '@heroicons/react/solid'
import {
  CircleDash,
  Events,
  Scale,
  Scales,
  ScalesTipped,
  Time,
} from '@carbon/icons-react'
import { capitalize } from '@utils/helpers'
import { ClockIcon } from '@heroicons/react/outline'
import useProposal from '@hooks/useProposal'
import { VoteTipping } from '@solana/spl-governance'
import { secondsInDay } from 'date-fns'

// I love enums!
const TIPPING = {
  [VoteTipping.Disabled]: 'Disabled',
  [VoteTipping.Early]: 'Early',
  [VoteTipping.Strict]: 'Strict',
} as const

const VotingRules = ({}) => {
  const { proposal, governance } = useProposal()
  const votingPop = useVotingPop()

  console.log('aaa', proposal)

  const threshold =
    votingPop === 'community'
      ? governance?.account.config.communityVoteThreshold
      : governance?.account.config.councilVoteThreshold

  const tipping =
    votingPop === 'community'
      ? governance?.account.config.communityVoteTipping
      : governance?.account.config.councilVoteTipping

  const voteDurationDays =
    governance?.account.config.baseVotingTime !== undefined &&
    governance?.account.config.votingCoolOffTime !== undefined
      ? (governance.account.config.baseVotingTime +
          governance?.account.config.votingCoolOffTime) /
        secondsInDay
      : undefined

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <h3 className="mb-0">Voting Rules</h3>
      <div /** Badges */ className="flex gap-1 flex-wrap">
        <div className="bg-neutral-900 rounded-sm py-1 px-2 text-neutral-300 flex items-center gap-1">
          <Events /> {capitalize(votingPop)}
        </div>
        {voteDurationDays !== undefined && (
          <div className="bg-neutral-900 rounded-sm py-1 px-2 text-neutral-300 flex items-center gap-1">
            <Time /> {voteDurationDays.toFixed(1).replace(/[.,]0$/, '')}d
          </div>
        )}
        {threshold?.value !== undefined && (
          <div className="bg-neutral-900 rounded-sm py-1 px-2 text-neutral-300 flex items-center gap-1">
            <Scales /> {threshold.value}%
          </div>
        )}
        <div className="bg-neutral-900 rounded-sm py-1 px-2 text-neutral-300 flex items-center gap-1">
          <ScalesTipped /> {tipping ? TIPPING[tipping] : null}
        </div>
      </div>
    </div>
  )
}

export default VotingRules
