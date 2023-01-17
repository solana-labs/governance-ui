import BuildingIcon from '@carbon/icons-react/lib/Building';
import { BigNumber } from 'bignumber.js';
import { produce } from 'immer';

import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SliderValue } from '../SliderValue';
import { CouncilRules } from '../types';
import { ValueBlock } from '../ValueBlock';
import { VoteTippingSelector } from '../VoteTippingSelector';
import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import { Input } from '@hub/components/controls/Input';
import { Slider } from '@hub/components/controls/Slider';
import { formatNumber } from '@hub/lib/formatNumber';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    councilRules: NonNullable<CouncilRules>;
  }> {
  className?: string;
  currentCouncilRules: NonNullable<CouncilRules>;
}

export function CouncilDetails(props: Props) {
  const councilPowerPercent = props.councilRules.votingPowerToCreateProposals
    .dividedBy(props.councilRules.totalSupply)
    .multipliedBy(100);

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<BuildingIcon />}
        text="Council Details"
      />
      <div className="space-y-8">
        <ValueBlock
          title="Do you want to allow council members to create proposals?"
          description="If disabled, the council members can no longer create proposals."
        >
          <ButtonToggle
            className="h-14"
            value={props.councilRules.canCreateProposal}
            onChange={(value) => {
              const newRules = produce(props.councilRules, (data) => {
                data.canCreateProposal = value;
              });
              props.onCouncilRulesChange?.(newRules);
            }}
          />
        </ValueBlock>
        {props.councilRules.canCreateProposal && (
          <ValueBlock
            title="What is the minimum amount of council governance power required to create a proposal?"
            description="A user must have this many council governance power in order to create a proposal."
          >
            <div className="relative">
              <Input
                className="w-full pr-24"
                placeholder="amount of governance power"
                value={formatNumber(
                  props.councilRules.votingPowerToCreateProposals,
                  undefined,
                  {
                    maximumFractionDigits: 0,
                  },
                )}
                onChange={(e) => {
                  const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
                  const value = text ? new BigNumber(text) : new BigNumber(0);
                  const newRules = produce(props.councilRules, (data) => {
                    data.votingPowerToCreateProposals = value;
                  });
                  props.onCouncilRulesChange?.(newRules);
                }}
              />
              <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
                Tokens
              </div>
            </div>
            <div className="flex items-center justify-end">
              {props.councilRules.totalSupply.isGreaterThan(0) && (
                <div className="mt-1 text-xs text-neutral-500">
                  {councilPowerPercent.isGreaterThan(0)
                    ? councilPowerPercent.isLessThan(0.01)
                      ? '<0.01'
                      : formatNumber(councilPowerPercent, undefined, {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 0,
                        })
                    : 0}
                  % of token supply
                </div>
              )}
            </div>
          </ValueBlock>
        )}
        <ValueBlock
          title="Do you want to allow council members to vote?"
          description="If disabled, the council members can no longer vote on proposals."
        >
          <ButtonToggle
            className="h-14"
            value={props.councilRules.canVote}
            onChange={(value) => {
              const newRules = produce(props.councilRules, (data) => {
                data.canVote = value;
              });
              props.onCouncilRulesChange?.(newRules);
            }}
          />
        </ValueBlock>
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
        <ValueBlock
          title="Do you want your council to have veto power over community proposals?"
          description="Your council can veto a community-approved proposal."
        >
          <ButtonToggle
            className="h-14"
            value={props.councilRules.canVeto}
            onChange={(value) => {
              const newRules = produce(props.councilRules, (data) => {
                data.canVeto = value;
              });
              props.onCouncilRulesChange?.(newRules);
            }}
          />
        </ValueBlock>
        {props.councilRules.canVeto && (
          <ValueBlock
            title="Council Veto Voting Quorum"
            description={
              <>
                The percentage of <span className="font-bold">No</span> votes
                required to veto a community proposal
              </>
            }
          >
            <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
              <SliderValue
                min={1}
                max={100}
                value={props.councilRules.vetoQuorumPercent}
                units="%"
                onChange={(value) => {
                  const newRules = produce(props.councilRules, (data) => {
                    data.vetoQuorumPercent = value;
                  });
                  props.onCouncilRulesChange?.(newRules);
                }}
              />
              <Slider
                min={1}
                max={100}
                trackColor="bg-sky-400"
                value={props.councilRules.vetoQuorumPercent}
                onChange={(value) => {
                  const newRules = produce(props.councilRules, (data) => {
                    data.vetoQuorumPercent = value;
                  });
                  props.onCouncilRulesChange?.(newRules);
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
