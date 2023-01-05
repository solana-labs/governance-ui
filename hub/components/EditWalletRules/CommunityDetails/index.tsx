import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
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
    communityCanCreate: boolean;
    communityHasVeto: boolean;
    communityQuorumPercent: number;
    communityVoteTipping: VoteTipping;
    minCommunityPower: number;
  }> {
  className?: string;
}

export function CommunityDetails(props: Props) {
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
          description="asdf asdf asdf asdf asdf"
        >
          <ButtonToggle
            className="h-14"
            value={props.communityCanCreate}
            onChange={props.onCommunityCanCreateChange}
          />
        </ValueBlock>
        <ValueBlock
          title="What is the minimum amount of community tokens required to create a proposal?"
          description="A user must have this many community tokens in order to create a proposal."
        >
          <div className="relative">
            <Input
              className="w-full"
              placeholder="# of tokens"
              value={formatNumber(props.minCommunityPower, undefined, {
                maximumFractionDigits: 0,
              })}
              onChange={(e) => {
                const text = e.currentTarget.value.replaceAll(',', '');
                const numVal = parseInt(text, 10);
                props.onMinCommunityPowerChange?.(numVal || 0);
              }}
            />
          </div>
        </ValueBlock>
        <ValueBlock
          title="Community Voting Quorum"
          description="The percentage of Yes votes required to pass a proposal"
        >
          <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
            <SliderValue value={props.communityQuorumPercent} units="%" />
            <Slider
              min={1}
              max={100}
              trackColor="bg-sky-400"
              value={props.communityQuorumPercent}
              onChange={props.onCommunityQuorumPercentChange}
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
            value={props.communityVoteTipping}
            onChange={props.onCommunityVoteTippingChange}
          />
        </ValueBlock>
        <ValueBlock
          title="Do you want your community to have veto power over council proposals?"
          description="Your community can veto a council-approved proposal during its Cool-Off Duration."
        >
          <ButtonToggle
            className="h-14"
            value={props.communityHasVeto}
            onChange={props.onCommunityHasVetoChange}
          />
        </ValueBlock>
      </div>
    </SectionBlock>
  );
}
