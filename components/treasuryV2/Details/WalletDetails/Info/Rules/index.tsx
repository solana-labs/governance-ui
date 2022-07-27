import {
  CalendarIcon,
  ClockIcon,
  HandIcon,
  LibraryIcon,
  OfficeBuildingIcon,
  PencilIcon,
  ScaleIcon,
  UserGroupIcon,
} from '@heroicons/react/outline'
import { VoteTipping } from '@solana/spl-governance'
import cx from 'classnames'
import React, { useState } from 'react'

import { formatNumber } from '@utils/formatNumber'
import { ntext } from '@utils/ntext'
import { Wallet } from '@models/treasury/Wallet'
import GovernanceConfigModal from 'pages/dao/[symbol]/params/GovernanceConfigModal'

import Section from './Section'
import Title from './Title'
import TokenIcon from '../../../../icons/TokenIcon'

const UNIX_SECOND = 1
const UNIX_MINUTE = UNIX_SECOND * 60
const UNIX_HOUR = UNIX_MINUTE * 60
const UNIX_DAY = UNIX_HOUR * 24

function voteTippingText(voteTipping: VoteTipping) {
  switch (voteTipping) {
    case VoteTipping.Disabled:
      return 'Disabled'
    case VoteTipping.Early:
      return 'Early'
    case VoteTipping.Strict:
      return 'Strict'
  }
}

function durationStr(duration: number) {
  if (duration === 0) {
    return '0 days'
  }

  if (duration > UNIX_DAY) {
    const count = duration / UNIX_DAY
    return count + ' ' + ntext(count, 'day')
  }

  if (duration > UNIX_HOUR) {
    const count = duration / UNIX_HOUR
    return count + ' ' + ntext(count, 'hour')
  }

  if (duration > UNIX_MINUTE) {
    const count = duration / UNIX_MINUTE
    return count + ' ' + ntext(count, 'minute')
  }

  const count = duration / UNIX_SECOND
  return count + ' ' + ntext(count, 'second')
}

interface Props {
  className?: string
  wallet: Wallet
}

export default function Rules(props: Props) {
  const [editRulesOpen, setEditRulesOpen] = useState(false)

  const hasCommunity =
    props.wallet.rules.community && props.wallet.rules.community?.address
  const hasCouncil =
    props.wallet.rules.council && props.wallet.rules.council?.address
  const hasRules = hasCommunity || hasCouncil

  return (
    <section className={props.className}>
      {props.wallet.governanceAccount && (
        <button
          className="flex items-center space-x-1 text-primary-light text-sm mb-8"
          onClick={() => setEditRulesOpen(true)}
        >
          <PencilIcon className="h-4 w-4 stroke-primary-light" />
          <div>Edit Wallet Rules</div>
        </button>
      )}
      {hasRules ? (
        <div
          className={cx(
            'gap-x-4',
            'gap-y-8',
            'grid',
            hasCommunity && hasCouncil ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {props.wallet.rules.community &&
            props.wallet.rules.community?.address && (
              <Title
                address={props.wallet.rules.community?.address}
                icon={<UserGroupIcon />}
                name="Community Rules"
              />
            )}
          {props.wallet.rules.council &&
            props.wallet.rules.council?.address && (
              <Title
                address={props.wallet.rules.council?.address}
                icon={<OfficeBuildingIcon />}
                name="Council Rules"
              />
            )}
          {hasCommunity && props.wallet.rules.community && (
            <Section
              icon={<CalendarIcon />}
              name="Max Voting Time"
              value={durationStr(props.wallet.rules.community.maxVotingTime)}
            />
          )}
          {hasCouncil && props.wallet.rules.council && (
            <Section
              icon={<CalendarIcon />}
              name="Max Voting Time"
              value={durationStr(props.wallet.rules.council.maxVotingTime)}
            />
          )}
          {hasCommunity && props.wallet.rules.community && (
            <Section
              icon={<TokenIcon />}
              name="Min Tokens to Create a Proposal"
              value={formatNumber(
                props.wallet.rules.community.minTokensToCreateProposal,
                undefined,
                { maximumFractionDigits: 0 }
              )}
            />
          )}
          {hasCouncil && props.wallet.rules.council && (
            <Section
              icon={<TokenIcon />}
              name="Min Tokens to Create a Proposal"
              value={formatNumber(
                props.wallet.rules.council.minTokensToCreateProposal,
                undefined,
                { maximumFractionDigits: 0 }
              )}
            />
          )}
          {hasCommunity && props.wallet.rules.community && (
            <Section
              icon={<ClockIcon />}
              name="Min Instruction Holdup Time"
              value={durationStr(
                props.wallet.rules.community.minInstructionHoldupTime
              )}
            />
          )}
          {hasCouncil && props.wallet.rules.council && (
            <Section
              icon={<ClockIcon />}
              name="Min Instruction Holdup Time"
              value={durationStr(
                props.wallet.rules.council.minInstructionHoldupTime
              )}
            />
          )}
          {hasCommunity && props.wallet.rules.community && (
            <Section
              icon={<ScaleIcon />}
              name="Vote Threshold Percentage"
              value={props.wallet.rules.community.voteThresholdPercentage + '%'}
            />
          )}
          {hasCouncil && props.wallet.rules.council && (
            <Section
              icon={<ScaleIcon />}
              name="Vote Threshold Percentage"
              value={props.wallet.rules.council.voteThresholdPercentage + '%'}
            />
          )}
          {hasCommunity && props.wallet.rules.community && (
            <Section
              icon={<HandIcon />}
              name="Vote Tipping"
              value={voteTippingText(props.wallet.rules.community.voteTipping)}
            />
          )}
          {hasCouncil && props.wallet.rules.council && (
            <Section
              icon={<HandIcon />}
              name="Vote Tipping"
              value={voteTippingText(props.wallet.rules.council.voteTipping)}
            />
          )}
        </div>
      ) : (
        <div>This Wallet has no rules</div>
      )}
      {props.wallet.governanceAddress && (
        <Title
          address={props.wallet.governanceAddress}
          className="mt-12"
          icon={<LibraryIcon />}
          name="Governance"
        />
      )}
      {editRulesOpen && props.wallet.governanceAccount && (
        <GovernanceConfigModal
          isProposalModalOpen
          governance={props.wallet.governanceAccount}
          closeProposalModal={() => setEditRulesOpen(false)}
        />
      )}
    </section>
  )
}
