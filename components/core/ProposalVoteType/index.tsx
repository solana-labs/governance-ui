import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown'
import RuleIcon from '@carbon/icons-react/lib/Rule'
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple'
import WalletIcon from '@carbon/icons-react/lib/Wallet'
import { useState } from 'react'

import { SectionBlock } from '../SectionBlock'
import { SectionHeader } from '../SectionHeader'
import { SummaryItem } from '../SummaryItem'
import { CommunityRules, CouncilRules } from '../types'
import { ValueBlock } from '../ValueBlock'
import { getLabel } from '../VoteTippingSelector'

import { ButtonToggle } from '@hub/components/controls/ButtonToggle'
import cx from '@hub/lib/cx'
import { ntext } from '@hub/lib/ntext'
import { FormProps } from '@hub/types/FormProps'

interface Props
  extends FormProps<{
    proposalVoteType: 'council' | 'community'
  }> {
  className?: string
  initialCommunityRules: CommunityRules
  initialCouncilRules: CouncilRules
  initialBaseVoteDays: number
  initialCoolOffHours: number
  initialMinInstructionHoldupDays: number
}

export function ProposalVoteType(props: Props) {
  const [showRules, setShowRules] = useState(false)

  const rules =
    props.proposalVoteType === 'council' && props.initialCouncilRules
      ? props.initialCouncilRules
      : props.initialCommunityRules

  const unrestrictedVotingHours = 24 * props.initialBaseVoteDays
  const unrestrictedVotingDays = Math.floor(unrestrictedVotingHours / 24)
  const unrestrictedVotingRemainingHours =
    unrestrictedVotingHours - unrestrictedVotingDays * 24

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<WalletIcon />}
        text="Membership Voting"
      />
      {!!props.initialCouncilRules &&
      props.initialCouncilRules.canVote &&
      props.initialCommunityRules.canVote ? (
        <ValueBlock
          title="Who should vote on this proposal?"
          description="Community or council?"
        >
          <ButtonToggle
            disableValueTrue={!props.initialCommunityRules.canVote}
            disableValueFalse={!props.initialCouncilRules}
            value={props.proposalVoteType === 'community'}
            valueTrueText="Community"
            valueFalseText="Council"
            onChange={(value) => {
              if (value === false && !!props.initialCouncilRules) {
                props.onProposalVoteTypeChange?.('council')
              } else {
                props.onProposalVoteTypeChange?.('community')
              }
            }}
          />
        </ValueBlock>
      ) : props.proposalVoteType === 'council' ? (
        <div className="text-white text-lg">
          The proposal will be voted on by council members
        </div>
      ) : (
        <div className="text-white text-lg">
          The proposal will be voted on by community members
        </div>
      )}
      {showRules && (
        <div className="mt-8">
          <div className="flex items-center">
            {props.proposalVoteType === 'community' ? (
              <UserMultipleIcon className="h-4 fill-neutral-500 mr-3 w-4" />
            ) : (
              <RuleIcon className="h-4 fill-neutral-500 mr-3 w-4" />
            )}
            <div className="text-neutral-500">
              Current{' '}
              {props.proposalVoteType === 'community' ? 'Community' : 'Council'}{' '}
              Rules
            </div>
          </div>
          <div className="gap-x-4 gap-y-8 grid grid-cols-2 mt-8">
            <SummaryItem
              label="Unrestricted Voting Time"
              value={
                `${unrestrictedVotingDays} ${ntext(
                  unrestrictedVotingDays,
                  'day'
                )}` +
                (unrestrictedVotingRemainingHours
                  ? ` ${unrestrictedVotingRemainingHours} ${ntext(
                      unrestrictedVotingRemainingHours,
                      'hour'
                    )}`
                  : '')
              }
            />
            <SummaryItem
              label="Voting Cool-off Hours"
              value={`${props.initialCoolOffHours} ${ntext(
                props.initialCoolOffHours,
                'hour'
              )}`}
            />
            <SummaryItem
              label="Min Instruction Holdup Time"
              value={`${props.initialMinInstructionHoldupDays} ${ntext(
                props.initialMinInstructionHoldupDays,
                'day'
              )}`}
            />
            <SummaryItem
              label="Approval Quorum"
              value={`${rules.quorumPercent}%`}
            />
            <SummaryItem
              label="Vote Tipping"
              value={getLabel(rules.voteTipping)}
            />
            {props.proposalVoteType === 'council' &&
              props.initialCommunityRules.canVeto && (
                <SummaryItem
                  label="Community Veto Quorum"
                  value={`${props.initialCommunityRules.vetoQuorumPercent}%`}
                />
              )}
            {props.proposalVoteType === 'community' &&
              props.initialCouncilRules &&
              props.initialCouncilRules.canVeto && (
                <SummaryItem
                  label="Council Veto Quorum"
                  value={`${props.initialCommunityRules.vetoQuorumPercent}%`}
                />
              )}
          </div>
        </div>
      )}
      <button
        className="flex items-center mt-10 text-sm text-neutral-500"
        onClick={() => setShowRules((cur) => !cur)}
      >
        {showRules ? 'Hide' : 'Show'} Voting Rules{' '}
        <ChevronDownIcon
          className={cx(
            'h-4',
            'ml-1.5',
            'transition-transform',
            'w-4',
            showRules && '-rotate-180'
          )}
        />
      </button>
    </SectionBlock>
  )
}
