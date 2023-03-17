import BuildingIcon from '@carbon/icons-react/lib/Building';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import { useState } from 'react';

import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SummaryItem } from '../SummaryItem';
import { CommunityRules, CouncilRules } from '../types';
import { ValueBlock } from '../ValueBlock';
import { getLabel } from '../VoteTippingSelector';

import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import cx from '@hub/lib/cx';
import { ntext } from '@hub/lib/ntext';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    proposalVoteType: 'council' | 'community';
  }> {
  className?: string;
  currentCommunityRules: CommunityRules;
  currentCouncilRules: CouncilRules;
  currentBaseVoteDays: number;
  currentCoolOffHours: number;
  currentMinInstructionHoldupDays: number;
}

export function ProposalVoteType(props: Props) {
  const [showRules, setShowRules] = useState(false);

  const rules =
    props.proposalVoteType === 'council' && props.currentCouncilRules
      ? props.currentCouncilRules
      : props.currentCommunityRules;

  const unrestrictedVotingHours = 24 * props.currentBaseVoteDays;
  const unrestrictedVotingDays = Math.floor(unrestrictedVotingHours / 24);
  const unrestrictedVotingRemainingHours =
    unrestrictedVotingHours - unrestrictedVotingDays * 24;

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<WalletIcon />}
        text="Membership Voting"
      />
      {!!props.currentCouncilRules &&
      props.currentCouncilRules.canVote &&
      props.currentCommunityRules.canVote ? (
        <ValueBlock
          title="Who should vote on this proposal?"
          description="Community or council?"
        >
          <ButtonToggle
            disableValueTrue={!props.currentCommunityRules.canVote}
            disableValueFalse={!props.currentCouncilRules}
            value={props.proposalVoteType === 'community'}
            valueTrueText="Community"
            valueFalseText="Council"
            onChange={(value) => {
              if (value === false && !!props.currentCouncilRules) {
                props.onProposalVoteTypeChange?.('council');
              } else {
                props.onProposalVoteTypeChange?.('community');
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
              <BuildingIcon className="h-4 fill-neutral-500 mr-3 w-4" />
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
                  'day',
                )}` +
                (unrestrictedVotingRemainingHours
                  ? ` ${unrestrictedVotingRemainingHours} ${ntext(
                      unrestrictedVotingRemainingHours,
                      'hour',
                    )}`
                  : '')
              }
            />
            <SummaryItem
              label="Voting Cool-off Hours"
              value={`${props.currentCoolOffHours} ${ntext(
                props.currentCoolOffHours,
                'hour',
              )}`}
            />
            <SummaryItem
              label="Min Instruction Holdup Time"
              value={`${props.currentMinInstructionHoldupDays} ${ntext(
                props.currentMinInstructionHoldupDays,
                'day',
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
              props.currentCommunityRules.canVeto && (
                <SummaryItem
                  label="Community Veto Quorum"
                  value={`${props.currentCommunityRules.vetoQuorumPercent}%`}
                />
              )}
            {props.proposalVoteType === 'community' &&
              props.currentCouncilRules &&
              props.currentCouncilRules.canVeto && (
                <SummaryItem
                  label="Council Veto Quorum"
                  value={`${props.currentCommunityRules.vetoQuorumPercent}%`}
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
            showRules && '-rotate-180',
          )}
        />
      </button>
    </SectionBlock>
  );
}
