import { useState } from 'react'
import { useVotingPop } from './VotePanel/hooks'
import {
  ChevronRight,
  ChevronUp,
  Events,
  Information,
  InformationFilled,
  Scales,
  ScalesTipped,
  Time,
} from '@carbon/icons-react'
import { capitalize } from '@utils/helpers'
import useProposal from '@hooks/useProposal'
import { VoteTipping, getNativeTreasuryAddress } from '@solana/spl-governance'
import { secondsInDay } from 'date-fns'
import clsx from 'clsx'
import { TimerBar } from './ProposalTimer'
import { formatShortAddress } from '@cardinal/namespaces-components'
import { useAsync } from 'react-async-hook'
import { useVetoingPop } from './VotePanel/VetoButtons'
import useRealm from '@hooks/useRealm'
import { ACCOUNT_NAMES } from './instructions/tools'
import { ExploreButton } from './treasuryV2/Details/ExploreLink'
import Tooltip from './Tooltip'
import { InformationCircleIcon } from '@heroicons/react/solid'

const formatOneDecimal = (x: number) => x.toFixed(1).replace(/[.,]0$/, '')

const formatDays = (x: number) =>
  formatOneDecimal(x) + ' ' + (x === 1 ? 'day' : 'days')

// I love enums!
const TIPPING = {
  [VoteTipping.Disabled]: 'Disabled',
  [VoteTipping.Early]: 'Early',
  [VoteTipping.Strict]: 'Strict',
} as const

const VotingRules = ({}) => {
  const { proposal, governance } = useProposal()
  const votingPop = useVotingPop()
  const vetoVotePop = useVetoingPop()
  const { symbol } = useRealm()

  const [showMore, setShowMore] = useState(false)

  const threshold =
    votingPop === 'community'
      ? governance?.account.config.communityVoteThreshold
      : governance?.account.config.councilVoteThreshold

  const vetoVoteThreshold =
    !!vetoVotePop && vetoVotePop === 'community'
      ? governance?.account.config.communityVetoVoteThreshold
      : governance?.account.config.councilVetoVoteThreshold

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

  const treasuryAddress = useAsync(
    async () =>
      governance !== undefined
        ? getNativeTreasuryAddress(governance.owner, governance.pubkey)
        : undefined,
    [governance]
  )

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setShowMore((prev) => !prev)}
      >
        <h3 className="mb-0">Voting Rules</h3>
        <ChevronUp
          size={20}
          className={clsx('transition-transform', showMore && 'rotate-180')}
        />
      </div>
      <div /** Badges */ className="flex gap-1 flex-wrap text-xs">
        <div className="bg-neutral-900 rounded-sm py-1 px-2 text-neutral-300 flex items-center gap-1">
          <Events /> {capitalize(votingPop)}
        </div>
        {voteDurationDays !== undefined && (
          <div className="bg-neutral-900 rounded-sm py-1 px-2 text-neutral-300 flex items-center gap-1">
            <Time /> {formatOneDecimal(voteDurationDays)}d
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
      <div
        /** wallet rules */
        className={clsx(showMore && 'hidden', 'text-xs flex flex-col gap-5')}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <div
              className="text-neutral-500 flex items-center gap-1 cursor-pointer"
              onClick={() =>
                window.open(`/dao/${symbol}/treasury/v2`, '_blank')
              }
            >
              <div>Wallet</div>
              <ChevronRight className="scale-75" />
            </div>
            {treasuryAddress.result && (
              <div className="flex gap-1 items-center">
                <div>
                  {ACCOUNT_NAMES[treasuryAddress.result.toString()]
                    ? ACCOUNT_NAMES[treasuryAddress.result.toString()]
                    : formatShortAddress(treasuryAddress.result)}
                </div>
                <ExploreButton address={treasuryAddress.result.toString()} />
              </div>
            )}
          </div>
          <div>
            <div className="text-neutral-500">Vote Type</div>
            <div>{capitalize(votingPop)}</div>
          </div>
          <div>
            <div className="text-neutral-500">Approval Quorum</div>
            {threshold?.value !== undefined && <div>{threshold.value}%</div>}
          </div>
          {vetoVotePop && vetoVoteThreshold?.value && (
            <>
              <div>
                <div className="text-neutral-500">Veto Power</div>
                <div>{capitalize(vetoVotePop)}</div>
              </div>
              <div>
                <div className="text-neutral-500">Veto Quorum</div>
                <div>{vetoVoteThreshold.value}%</div>
              </div>
            </>
          )}
          <div>
            <div className="text-neutral-500">Vote Tipping</div>
            <div>{tipping ? TIPPING[tipping] : null}</div>
          </div>
        </div>
        <div className=" h-0 border border-neutral-900" />
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <div className="text-neutral-500">Total Voting Duration</div>
            {voteDurationDays !== undefined && (
              <div>{formatDays(voteDurationDays)}</div>
            )}
          </div>
          <div>
            <div className="text-neutral-500">
              Unrestricted <br />
              <div className="flex items-center gap-1">
                <div>Voting Time </div>
                <div className="">
                  <Tooltip
                    content={
                      'The amount of time a voter has to approve or deny a proposal.'
                    }
                  >
                    <InformationFilled className="cursor-help h-3 w-3" />
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="rounded-sm h-1 w-1 bg-sky-500 inline-block" />
              <div>
                {governance?.account.config.baseVotingTime !== undefined
                  ? formatDays(
                      governance.account.config.baseVotingTime / secondsInDay
                    )
                  : null}
              </div>
            </div>
          </div>
          <div>
            <div className="text-neutral-500">
              Cool-off <br />
              <div className="flex items-center gap-1">
                <div>Voting Time </div>
                <div className="">
                  <Tooltip
                    content={
                      'After the unrestricted voting time, this is the amount of time a voter has to deny, veto, or withdraw a vote on a proposal.'
                    }
                  >
                    <InformationFilled className="cursor-help h-3 w-3" />
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="rounded-sm h-1 w-1 bg-amber-400 inline-block" />
              <div>
                {governance?.account.config.votingCoolOffTime !== undefined
                  ? formatDays(
                      governance.account.config.votingCoolOffTime / secondsInDay
                    )
                  : null}
              </div>
            </div>
          </div>
        </div>
        {governance?.account !== undefined &&
        proposal?.account !== undefined ? (
          <TimerBar
            governance={governance.account}
            proposal={proposal.account}
            size="lg"
          />
        ) : null}
      </div>
    </div>
  )
}

export default VotingRules
