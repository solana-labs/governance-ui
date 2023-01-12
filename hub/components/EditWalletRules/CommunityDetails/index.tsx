import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import { BigNumber } from 'bignumber.js';
import { produce } from 'immer';

import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SliderValue } from '../SliderValue';
import { CommunityRules } from '../types';
import { ValueBlock } from '../ValueBlock';
import { VoteTippingSelector } from '../VoteTippingSelector';
import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import { Input } from '@hub/components/controls/Input';
import { Slider } from '@hub/components/controls/Slider';
import { formatNumber } from '@hub/lib/formatNumber';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    communityRules: CommunityRules;
  }> {
  currentCommunityRules: CommunityRules;
  className?: string;
}

export function CommunityDetails(props: Props) {
  const communityPowerPercent = props.communityRules.votingPowerToCreateProposals
    .dividedBy(props.communityRules.totalSupply)
    .multipliedBy(100);

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<UserMultipleIcon />}
        text="Community Details"
      />
      <div className="space-y-8">
        <ValueBlock
          title="Do you want to allow community members to create proposals?"
          description="If disabled, the community token members can no longer create proposals."
        >
          <ButtonToggle
            className="h-14"
            value={props.communityRules.canCreateProposal}
            onChange={(value) => {
              const newRules = produce(props.communityRules, (data) => {
                data.canCreateProposal = value;
              });
              props.onCommunityRulesChange?.(newRules);
            }}
          />
        </ValueBlock>
        {props.communityRules.canCreateProposal && (
          <ValueBlock
            title="What is the minimum amount of community tokens required to create a proposal?"
            description="A user must have this many community tokens in order to create a proposal."
          >
            <div className="relative">
              <Input
                className="w-full pr-24"
                placeholder="# of tokens"
                value={formatNumber(
                  props.communityRules.votingPowerToCreateProposals,
                  undefined,
                  {
                    maximumFractionDigits: 0,
                  },
                )}
                onChange={(e) => {
                  const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
                  const value = new BigNumber(text);
                  const newRules = produce(props.communityRules, (data) => {
                    data.votingPowerToCreateProposals = value;
                  });
                  props.onCommunityRulesChange?.(newRules);
                }}
              />
              <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
                Tokens
              </div>
            </div>
            <div className="flex items-center justify-end">
              <div className="mt-1 text-xs text-neutral-500">
                {communityPowerPercent.isGreaterThan(0)
                  ? communityPowerPercent.isLessThan(0.01)
                    ? '<0.01'
                    : formatNumber(communityPowerPercent, undefined, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0,
                      })
                  : 0}
                % of token supply
              </div>
            </div>
          </ValueBlock>
        )}
        <ValueBlock
          title="Do you want to allow community members to vote?"
          description="If disabled, the community token members can no longer vote on proposals."
        >
          <ButtonToggle
            className="h-14"
            value={props.communityRules.canVote}
            onChange={(value) => {
              const newRules = produce(props.communityRules, (data) => {
                data.canVote = value;
              });
              props.onCommunityRulesChange?.(newRules);
            }}
          />
        </ValueBlock>
        <ValueBlock
          title="Community Voting Quorum"
          description="The percentage of Yes votes required to pass a proposal"
        >
          <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
            <SliderValue
              min={1}
              max={100}
              value={props.communityRules.quorumPercent}
              units="%"
              onChange={(value) => {
                const newRules = produce(props.communityRules, (data) => {
                  data.quorumPercent = value;
                });
                props.onCommunityRulesChange?.(newRules);
              }}
            />
            <Slider
              min={1}
              max={100}
              trackColor="bg-sky-400"
              value={props.communityRules.quorumPercent}
              onChange={(value) => {
                const newRules = produce(props.communityRules, (data) => {
                  data.quorumPercent = value;
                });
                props.onCommunityRulesChange?.(newRules);
              }}
              onRenderValue={(val) => `${val}%`}
            />
          </div>
        </ValueBlock>
        <ValueBlock
          title="Community Vote Tipping"
          description="Decide when voting should end"
        >
          <VoteTippingSelector
            className="w-full"
            value={props.communityRules.voteTipping}
            onChange={(value) => {
              const newRules = produce(props.communityRules, (data) => {
                data.voteTipping = value;
              });
              props.onCommunityRulesChange?.(newRules);
            }}
          />
        </ValueBlock>
        <ValueBlock
          title="Do you want your community to have veto power over council proposals?"
          description="Your community can veto a council-approved proposal during its Cool-Off Duration."
        >
          <ButtonToggle
            className="h-14"
            value={props.communityRules.canVeto}
            onChange={(value) => {
              const newRules = produce(props.communityRules, (data) => {
                data.canVeto = value;
              });
              props.onCommunityRulesChange?.(newRules);
            }}
          />
        </ValueBlock>
        {props.communityRules.canVeto && (
          <ValueBlock
            title="Community Veto Voting Quorum"
            description={
              <>
                The percentage of <span className="font-bold">No</span> votes
                required to veto a council proposal
              </>
            }
          >
            <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
              <SliderValue
                min={1}
                max={100}
                value={props.communityRules.vetoQuorumPercent}
                units="%"
                onChange={(value) => {
                  const newRules = produce(props.communityRules, (data) => {
                    data.vetoQuorumPercent = value;
                  });
                  props.onCommunityRulesChange?.(newRules);
                }}
              />
              <Slider
                min={1}
                max={100}
                trackColor="bg-sky-400"
                value={props.communityRules.vetoQuorumPercent}
                onChange={(value) => {
                  const newRules = produce(props.communityRules, (data) => {
                    data.vetoQuorumPercent = value;
                  });
                  props.onCommunityRulesChange?.(newRules);
                }}
                onRenderValue={(val) => `${val}%`}
              />
            </div>
          </ValueBlock>
        )}
      </div>
    </SectionBlock>
  );
}
