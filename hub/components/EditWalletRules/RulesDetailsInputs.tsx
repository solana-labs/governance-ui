import { BigNumber } from 'bignumber.js';
import { produce } from 'immer';

import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import { Input } from '@hub/components/controls/Input';
import { Slider } from '@hub/components/controls/Slider';
import {
  CommunityRules,
  CouncilRules,
} from '@hub/components/EditWalletRules/types';
import { capitalize } from '@hub/lib/capitalize';
import { formatNumber } from '@hub/lib/formatNumber';
import { FormProps } from '@hub/types/FormProps';

import { SliderValue } from './SliderValue';
import { ValueBlock } from './ValueBlock';
import { VoteTippingSelector } from './VoteTippingSelector';

type Pop = 'community' | 'council';
interface Props
  extends FormProps<{
    rules: NonNullable<CouncilRules> | CommunityRules;
  }> {
  govPop: Pop;
}

export function VetoQuorumPercent(props: Props) {
  const otherPop = props.govPop === 'community' ? 'council' : 'community';

  return (
    <ValueBlock
      title={`${capitalize(props.govPop)} Veto Voting Quorum`}
      description={
        <>
          The percentage of <span className="font-bold">No</span> votes required
          to veto a {otherPop} proposal
        </>
      }
    >
      <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
        <SliderValue
          min={1}
          max={100}
          value={props.rules.vetoQuorumPercent}
          units="%"
          onChange={(value) => {
            const newRules = produce(props.rules, (data) => {
              data.vetoQuorumPercent = value;
            });
            props.onRulesChange?.(newRules);
          }}
        />
        <Slider
          min={1}
          max={100}
          trackColor="bg-sky-400"
          value={props.rules.vetoQuorumPercent}
          onChange={(value) => {
            const newRules = produce(props.rules, (data) => {
              data.vetoQuorumPercent = value;
            });
            props.onRulesChange?.(newRules);
          }}
          onRenderValue={(val) => `${val}%`}
        />
      </div>
    </ValueBlock>
  );
}

export function CanVeto(props: Props) {
  const otherPop = props.govPop === 'community' ? 'council' : 'community';

  return (
    <ValueBlock
      title={`Do you want your ${props.govPop} to have veto power over ${otherPop} proposals?`}
      description={`Your ${props.govPop} can veto a ${otherPop}-approved proposal.`}
    >
      <ButtonToggle
        className="h-14"
        value={props.rules.canVeto}
        onChange={(value) => {
          const newRules = produce(props.rules, (data) => {
            data.canVeto = value;
          });
          props.onRulesChange?.(newRules);
        }}
      />
    </ValueBlock>
  );
}

export function CanVote(props: Props) {
  return (
    <ValueBlock
      title={`Do you want to allow ${props.govPop} members to vote?`}
      description={`If disabled, the ${props.govPop} members can no longer vote on proposals.`}
    >
      <ButtonToggle
        className="h-14"
        value={props.rules.canVote}
        onChange={(value) => {
          const newRules = produce(props.rules, (data) => {
            data.canVote = value;
          });
          props.onRulesChange?.(newRules);
        }}
      />
    </ValueBlock>
  );
}

export function VotingPowerToCreateProposals(props: Props) {
  const councilPowerPercent = props.rules.votingPowerToCreateProposals
    .dividedBy(props.rules.totalSupply)
    .multipliedBy(100);

  return (
    <ValueBlock
      title={`What is the minimum amount of ${props.govPop} governance power required to create a proposal?`}
      description={`A user must have this many ${props.govPop} governance power in order to create a proposal.`}
    >
      <div className="relative">
        <Input
          className="w-full pr-24"
          placeholder="amount of governance power"
          value={formatNumber(
            props.rules.votingPowerToCreateProposals,
            undefined,
            {
              maximumFractionDigits: 0,
            },
          )}
          onChange={(e) => {
            const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
            const value = text ? new BigNumber(text) : new BigNumber(0);
            const newRules = produce(props.rules, (data) => {
              data.votingPowerToCreateProposals = value;
            });
            props.onRulesChange?.(newRules);
          }}
        />
        <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
          Tokens
        </div>
      </div>
      <div className="flex items-center justify-end">
        {props.rules.totalSupply.isGreaterThan(0) && (
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
  );
}

export function CanCreateProposal(props: Props) {
  return (
    <ValueBlock
      title={`Do you want to allow ${props.govPop} members to create proposals?`}
      description={`If disabled, the ${props.govPop} members can no longer create proposals.`}
    >
      <ButtonToggle
        className="h-14"
        value={props.rules.canCreateProposal}
        onChange={(value) => {
          const newRules = produce(props.rules, (data) => {
            data.canCreateProposal = value;
          });
          props.onRulesChange?.(newRules);
        }}
      />
    </ValueBlock>
  );
}

export function QuorumPercent(props: Props) {
  return (
    <ValueBlock
      title={`${capitalize(props.govPop)} Approval Quorum`}
      description="The percentage of Yes votes required to pass a proposal"
    >
      <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
        <SliderValue
          min={1}
          max={100}
          value={props.rules.quorumPercent}
          units="%"
          onChange={(value) => {
            const newRules = produce(props.rules, (data) => {
              data.quorumPercent = value;
            });
            props.onRulesChange?.(newRules);
          }}
        />
        <Slider
          min={1}
          max={100}
          trackColor="bg-sky-400"
          value={props.rules.quorumPercent}
          onChange={(value) => {
            const newRules = produce(props.rules, (data) => {
              data.quorumPercent = value;
            });
            props.onRulesChange?.(newRules);
          }}
          onRenderValue={(val) => `${val}%`}
        />
      </div>
    </ValueBlock>
  );
}

export function VoteTipping(props: Props) {
  return (
    <ValueBlock
      title={`${capitalize(props.govPop)} Vote Tipping`}
      description="Decide when voting should end"
    >
      <VoteTippingSelector
        className="w-full"
        value={props.rules.voteTipping}
        onChange={(value) => {
          const newRules = produce(props.rules, (data) => {
            data.voteTipping = value;
          });
          props.onRulesChange?.(newRules);
        }}
      />
    </ValueBlock>
  );
}
