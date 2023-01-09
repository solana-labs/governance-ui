import BuildingIcon from '@carbon/icons-react/lib/Building';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import type { VoteTipping } from '@solana/spl-governance';
import type { BigNumber } from 'bignumber.js';
import { useState } from 'react';

import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SummaryItem } from '../SummaryItem';
import { ValueBlock } from '../ValueBlock';
import { getLabel } from '../VoteTippingSelector';
import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { ntext } from '@hub/lib/ntext';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    proposalVoteType: 'council' | 'community';
  }> {
  className?: string;
  currentCommunityCanCreate: boolean;
  currentCommunityHasVeto: boolean;
  currentCommunityQuorumPercent: number;
  currentCommunityVetoQuorum: number;
  currentCommunityVoteTipping: VoteTipping;
  currentCoolOffHours: number;
  currentCouncilCanCreate: boolean;
  currentCouncilHasVeto: boolean;
  currentCouncilQuorumPercent: number;
  currentCouncilVetoQuorum: number;
  currentCouncilVoteTipping: VoteTipping;
  currentDepositExemptProposalCount: number;
  currentMaxVoteDays: number;
  currentMinCommunityPower: BigNumber;
  currentMinCouncilPower: BigNumber;
  currentMinInstructionHoldupDays: number;
}

export function ProposalVoteType(props: Props) {
  const [showRules, setShowRules] = useState(false);

  const communityRules = {
    approvalQuorum: props.currentCommunityQuorumPercent,
    hasVeto: props.currentCommunityHasVeto,
    maxVotingDays: props.currentMaxVoteDays,
    minInstructionHoldupDays: props.currentMinInstructionHoldupDays,
    minPowerToCreateProposal: props.currentMinCommunityPower,
    vetoQuorum: props.currentCommunityVetoQuorum,
    voteTipping: props.currentCommunityVoteTipping,
  };

  const councilRules = {
    approvalQuorum: props.currentCouncilQuorumPercent,
    hasVeto: props.currentCouncilHasVeto,
    maxVotingDays: props.currentMaxVoteDays,
    minInstructionHoldupDays: props.currentMinInstructionHoldupDays,
    minPowerToCreateProposal: props.currentMinCouncilPower,
    vetoQuorum: props.currentCouncilVetoQuorum,
    voteTipping: props.currentCouncilVoteTipping,
  };

  const rules =
    props.proposalVoteType === 'community' ? communityRules : councilRules;

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<WalletIcon />}
        text="Membership Voting"
      />
      <ValueBlock
        title="Who should vote on this proposal?"
        description="Community or council?"
      >
        <ButtonToggle
          value={props.proposalVoteType === 'community'}
          valueTrueText="Community"
          valueFalseText="Council"
          onChange={(value) =>
            props.onProposalVoteTypeChange?.(value ? 'community' : 'council')
          }
        />
      </ValueBlock>
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
              label="Max Voting Time"
              value={`${rules.maxVotingDays} ${ntext(
                rules.maxVotingDays,
                'day',
              )}`}
            />
            <SummaryItem
              label="Min Instruction Holdup Time"
              value={`${rules.minInstructionHoldupDays} ${ntext(
                rules.minInstructionHoldupDays,
                'day',
              )}`}
            />
            <SummaryItem
              label="Min Governance Power to Create a Proposal"
              value={formatNumber(rules.minPowerToCreateProposal, undefined, {
                maximumFractionDigits: 0,
              })}
            />
            <SummaryItem
              label="Approval Quorum"
              value={`${rules.approvalQuorum}%`}
            />
            <SummaryItem
              label="Vote Tipping"
              value={getLabel(rules.voteTipping)}
            />
            <SummaryItem
              label="Veto Quorum"
              value={rules.hasVeto ? `${rules.vetoQuorum}%` : 'Disabled'}
            />
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
