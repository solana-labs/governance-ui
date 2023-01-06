import BuildingIcon from '@carbon/icons-react/lib/Building';
import type { VoteTipping } from '@solana/spl-governance';
import { BigNumber } from 'bignumber.js';

import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SliderValue } from '../SliderValue';
import { ValueBlock } from '../ValueBlock';
import { VoteTippingSelector } from '../VoteTippingSelector';
import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import { Input } from '@hub/components/controls/Input';
import { Slider } from '@hub/components/controls/Slider';
import { formatNumber } from '@hub/lib/formatNumber';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    councilCanCreate: boolean;
    councilHasVeto: boolean;
    councilQuorumPercent: number;
    councilVoteTipping: VoteTipping;
    minCouncilPower: BigNumber;
  }> {
  className?: string;
  councilTokenSupply: BigNumber;
}

export function CouncilDetails(props: Props) {
  const councilPowerPercent = props.minCouncilPower
    .dividedBy(props.councilTokenSupply)
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
          description="asdf asdf asdf asdf asdf"
        >
          <ButtonToggle
            className="h-14"
            value={props.councilCanCreate}
            onChange={props.onCouncilCanCreateChange}
          />
        </ValueBlock>
        <ValueBlock
          title="What is the minimum amount of council tokens required to create a proposal?"
          description="A user must have this many council tokens in order to create a proposal."
        >
          <div className="relative">
            <Input
              className="w-full pr-24"
              placeholder="# of tokens"
              value={formatNumber(props.minCouncilPower, undefined, {
                maximumFractionDigits: 0,
              })}
              onChange={(e) => {
                const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
                props.onMinCouncilPowerChange?.(new BigNumber(text || 0));
              }}
            />
            <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
              Tokens
            </div>
          </div>
          <div className="flex items-center justify-end">
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
          </div>
        </ValueBlock>
        <ValueBlock
          title="Council Voting Quorum"
          description="The percentage of Yes votes required to pass a proposal"
        >
          <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
            <SliderValue value={props.councilQuorumPercent} units="%" />
            <Slider
              min={1}
              max={100}
              trackColor="bg-sky-400"
              value={props.councilQuorumPercent}
              onChange={props.onCouncilQuorumPercentChange}
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
            value={props.councilVoteTipping}
            onChange={props.onCouncilVoteTippingChange}
          />
        </ValueBlock>
        <ValueBlock
          title="Do you want your council to have veto power over community proposals?"
          description="Your council can veto a community-approved proposal during its Cool-Off Duration."
        >
          <ButtonToggle
            className="h-14"
            value={props.councilHasVeto}
            onChange={props.onCouncilHasVetoChange}
          />
        </ValueBlock>
      </div>
    </SectionBlock>
  );
}
