import BuildingIcon from '@carbon/icons-react/lib/Building';
import type { VoteTipping } from '@solana/spl-governance';

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
    minCouncilPower: number;
  }> {
  className?: string;
}

export function CouncilDetails(props: Props) {
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
              className="w-full"
              placeholder="# of tokens"
              value={formatNumber(props.minCouncilPower, undefined, {
                maximumFractionDigits: 0,
              })}
              onChange={(e) => {
                const text = e.currentTarget.value.replaceAll(',', '');
                const numVal = parseInt(text, 10);
                props.onMinCouncilPowerChange?.(numVal || 0);
              }}
            />
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
