import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
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
    communityCanCreate: boolean;
    communityHasVeto: boolean;
    communityQuorumPercent: number;
    communityVetoQuorum: number;
    communityVoteTipping: VoteTipping;
    minCommunityPower: BigNumber;
  }> {
  className?: string;
  communityTokenSupply: BigNumber;
}

export function CommunityDetails(props: Props) {
  const communityPowerPercent = props.minCommunityPower
    .dividedBy(props.communityTokenSupply)
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
              className="w-full pr-24"
              placeholder="# of tokens"
              value={formatNumber(props.minCommunityPower, undefined, {
                maximumFractionDigits: 0,
              })}
              onChange={(e) => {
                const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
                props.onMinCommunityPowerChange?.(new BigNumber(text || 0));
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
        {props.communityHasVeto && (
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
              <SliderValue value={props.communityVetoQuorum} units="%" />
              <Slider
                min={1}
                max={100}
                trackColor="bg-sky-400"
                value={props.communityVetoQuorum}
                onChange={props.onCommunityVetoQuorumChange}
                onRenderValue={(val) => `${val}%`}
              />
            </div>
          </ValueBlock>
        )}
      </div>
    </SectionBlock>
  );
}
