import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import { useState, useMemo } from 'react';

import {
  CanCreateProposal,
  CanVeto,
  CanVote,
  QuorumPercent,
  VetoQuorumPercent,
  VoteTipping,
  VotingPowerToCreateProposals,
} from '../RulesDetailsInputs';
import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { CommunityRules, CouncilRules } from '../types';
import cx from '@hub/lib/cx';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    communityRules: CommunityRules;
  }> {
  initialCommunityRules: CommunityRules;
  initialCouncilRules?: CouncilRules;
  className?: string;
  programVersion: number;
}

export function CommunityDetails(props: Props) {
  const [additionalOptionsExpanded, setAdditionalOptionsExpanded] = useState(
    false,
  );

  const inputProps = useMemo(
    () => ({
      rules: props.communityRules,
      onRulesChange: props.onCommunityRulesChange,
      govPop: 'community' as const,
    }),
    [props.communityRules, props.onCommunityRulesChange],
  );

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<UserMultipleIcon />}
        text="Community Details"
      />
      <div className="space-y-8">
        {!!props.initialCouncilRules &&
          props.initialCouncilRules.canCreateProposal && (
            <CanCreateProposal {...inputProps} />
          )}
        {props.communityRules.canCreateProposal && (
          <VotingPowerToCreateProposals {...inputProps} />
        )}
        {!!props.initialCouncilRules && props.initialCouncilRules.canVote && (
          <CanVote {...inputProps} />
        )}
        {props.communityRules.canVote && (
          <>
            <QuorumPercent {...inputProps} />
            <VoteTipping {...inputProps} />
          </>
        )}
        {!!props.initialCouncilRules && props.initialCouncilRules.canVote && (
          <CanVeto {...inputProps} />
        )}
        {!!props.initialCouncilRules &&
          props.initialCouncilRules.canVote &&
          props.communityRules.canVeto && <VetoQuorumPercent {...inputProps} />}
        {!!props.initialCouncilRules &&
          (!props.initialCouncilRules.canVote ||
            !props.initialCouncilRules.canCreateProposal) && (
            <button
              className="flex items-center text-sm text-neutral-500"
              onClick={() => setAdditionalOptionsExpanded((cur) => !cur)}
            >
              Additional options{' '}
              <ChevronDownIcon
                className={cx(
                  'fill-current',
                  'h-4',
                  'transition-transform',
                  'w-4',
                  additionalOptionsExpanded && '-rotate-180',
                )}
              />
            </button>
          )}
        {additionalOptionsExpanded && (
          <>
            {!!props.initialCouncilRules &&
              !props.initialCouncilRules.canCreateProposal && (
                <CanCreateProposal {...inputProps} />
              )}
            {!!props.initialCouncilRules &&
              !props.initialCouncilRules.canVote && <CanVote {...inputProps} />}
            {!!props.initialCouncilRules &&
              !props.initialCouncilRules.canVote && <CanVeto {...inputProps} />}
            {!!props.initialCouncilRules &&
              !props.initialCouncilRules.canVote &&
              props.communityRules.canVeto && (
                <VetoQuorumPercent {...inputProps} />
              )}
          </>
        )}
      </div>
    </SectionBlock>
  );
}
