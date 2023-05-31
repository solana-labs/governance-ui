import BuildingIcon from '@carbon/icons-react/lib/Building';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import { useState, useMemo } from 'react';

import {
  CanCreateProposal,
  VotingPowerToCreateProposals,
  CanVote,
  CanVeto,
  VetoQuorumPercent,
  QuorumPercent,
  VoteTipping,
} from '../RulesDetailsInputs';
import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import {
  CommunityRules,
  CouncilRules,
} from '@hub/components/EditWalletRules/types';
import cx from '@hub/lib/cx';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    councilRules: NonNullable<CouncilRules>;
  }> {
  className?: string;
  initialCommunityRules: CommunityRules;
  initialCouncilRules: NonNullable<CouncilRules>;
  programVersion: number;
}

export function CouncilDetails(props: Props) {
  const [additionalOptionsExpanded, setAdditionalOptionsExpanded] = useState(
    false,
  );

  const inputProps = useMemo(
    () => ({
      rules: props.councilRules,
      onRulesChange: props.onCouncilRulesChange,
      govPop: 'council' as const,
    }),
    [props.councilRules, props.onCouncilRulesChange],
  );

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<BuildingIcon />}
        text="Council Details"
      />
      <div className="space-y-8">
        {props.initialCommunityRules.canCreateProposal && (
          <CanCreateProposal {...inputProps} />
        )}
        {props.initialCommunityRules.canCreateProposal &&
          props.councilRules.canCreateProposal && (
            <VotingPowerToCreateProposals {...inputProps} />
          )}
        {props.initialCommunityRules.canVote && <CanVote {...inputProps} />}
        {props.councilRules.canVote && (
          <>
            <QuorumPercent {...inputProps} />
            <VoteTipping {...inputProps} />
          </>
        )}
        {props.initialCommunityRules.canVote && (
          <CanVeto {...inputProps} govPop="council" />
        )}
        {props.initialCommunityRules.canVote && props.councilRules.canVeto && (
          <VetoQuorumPercent {...inputProps} govPop="council" />
        )}
        {(!props.initialCommunityRules.canCreateProposal ||
          !props.initialCommunityRules.canVote) && (
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
            {!props.initialCommunityRules.canCreateProposal && (
              <CanCreateProposal {...inputProps} />
            )}
            {!props.initialCommunityRules.canCreateProposal &&
              props.councilRules.canCreateProposal && (
                <VotingPowerToCreateProposals {...inputProps} />
              )}
            {!props.initialCommunityRules.canVote && (
              <CanVote {...inputProps} />
            )}
            {!props.initialCommunityRules.canVote && (
              <CanVeto {...inputProps} />
            )}
            {!props.initialCommunityRules.canVote &&
              props.councilRules.canVeto && (
                <VetoQuorumPercent {...inputProps} />
              )}
          </>
        )}
      </div>
    </SectionBlock>
  );
}
