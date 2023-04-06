import BuildingIcon from '@carbon/icons-react/lib/Building';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import { produce } from 'immer';
import { useState } from 'react';

import {
  CanCreateProposal,
  VotingPowerToCreateProposals,
  CanVote,
  CanVeto,
  VetoQuorumPercent,
} from '../RulesDetailsInputs';
import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SliderValue } from '../SliderValue';
import { ValueBlock } from '../ValueBlock';
import { VoteTippingSelector } from '../VoteTippingSelector';
import { Slider } from '@hub/components/controls/Slider';
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
  currentCommunityRules: CommunityRules;
  currentCouncilRules: NonNullable<CouncilRules>;
  programVersion: number;
}

export function CouncilDetails(props: Props) {
  const [additionalOptionsExpanded, setAdditionalOptionsExpanded] = useState(
    false,
  );

  const inputProps = {
    rules: props.councilRules,
    onRulesChange: props.onCouncilRulesChange,
    govPop: 'council' as const,
  };

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<BuildingIcon />}
        text="Council Details"
      />
      <div className="space-y-8">
        {props.currentCommunityRules.canCreateProposal && (
          <CanCreateProposal {...inputProps} />
        )}
        {props.currentCommunityRules.canCreateProposal &&
          props.councilRules.canCreateProposal && (
            <VotingPowerToCreateProposals {...inputProps} />
          )}
        {props.currentCommunityRules.canVote && <CanVote {...inputProps} />}
        {props.councilRules.canVote && (
          <>
            <ValueBlock
              title="Council Approval Quorum"
              description="The percentage of Yes votes required to pass a proposal"
            >
              <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
                <SliderValue
                  min={1}
                  max={100}
                  value={props.councilRules.quorumPercent}
                  units="%"
                  onChange={(value) => {
                    const newRules = produce(props.councilRules, (data) => {
                      data.quorumPercent = value;
                    });
                    props.onCouncilRulesChange?.(newRules);
                  }}
                />
                <Slider
                  min={1}
                  max={100}
                  trackColor="bg-sky-400"
                  value={props.councilRules.quorumPercent}
                  onChange={(value) => {
                    const newRules = produce(props.councilRules, (data) => {
                      data.quorumPercent = value;
                    });
                    props.onCouncilRulesChange?.(newRules);
                  }}
                  onRenderValue={(val) => `${val}%`}
                />
              </div>
            </ValueBlock>
            <ValueBlock
              title="Council Vote Tipping"
              description="Decide when voting should end"
            >
              <VoteTippingSelector
                className="w-full"
                value={props.councilRules.voteTipping}
                onChange={(value) => {
                  const newRules = produce(props.councilRules, (data) => {
                    data.voteTipping = value;
                  });
                  props.onCouncilRulesChange?.(newRules);
                }}
              />
            </ValueBlock>
          </>
        )}
        {props.currentCommunityRules.canVote && (
          <CanVeto {...inputProps} govPop="council" />
        )}
        {props.currentCommunityRules.canVote && props.councilRules.canVeto && (
          <VetoQuorumPercent {...inputProps} govPop="council" />
        )}
        {(!props.currentCommunityRules.canCreateProposal ||
          !props.currentCommunityRules.canVote) && (
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
            {!props.currentCommunityRules.canCreateProposal && (
              <CanCreateProposal {...inputProps} />
            )}
            {!props.currentCommunityRules.canCreateProposal &&
              props.councilRules.canCreateProposal && (
                <VotingPowerToCreateProposals {...inputProps} />
              )}
            {!props.currentCommunityRules.canVote && (
              <CanVote {...inputProps} />
            )}
            {!props.currentCommunityRules.canVote && (
              <CanVeto {...inputProps} />
            )}
            {!props.currentCommunityRules.canVote &&
              props.councilRules.canVeto && (
                <VetoQuorumPercent {...inputProps} />
              )}
          </>
        )}
      </div>
    </SectionBlock>
  );
}
