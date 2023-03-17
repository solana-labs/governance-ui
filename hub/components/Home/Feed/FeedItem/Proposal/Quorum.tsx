import ScalesTippedIcon from '@carbon/icons-react/lib/ScalesTipped';
import * as HoverCard from '@radix-ui/react-hover-card';
import type { BigNumber } from 'bignumber.js';

import { abbreviateNumber } from '@hub/lib/abbreviateNumber';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  percentThresholdMet: number | null;
  quorumReached?: boolean;
  quorumRemainder: BigNumber;
  totalVotesCast: BigNumber;
  threholdPercent: number | null;
}

export function Quorum(props: Props) {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger
        className={cx(props.className, 'flex', 'items-center')}
      >
        {props.totalVotesCast.eq(0) && (
          <div className="flex items-center space-x-1 text-neutral-500">
            <ScalesTippedIcon className="h-3 w-3 fill-current" />
            <div className="text-xs">No votes yet</div>
          </div>
        )}
        {props.quorumReached && (
          <div className="flex items-center space-x-1 text-neutral-500">
            <ScalesTippedIcon className="h-3 w-3 fill-current" />
            <div className="text-xs">Quorum reached</div>
          </div>
        )}
        {props.totalVotesCast.isGreaterThan(0) &&
          props.quorumRemainder.isGreaterThan(0) &&
          props.percentThresholdMet !== null && (
            <div className="flex items-center space-x-1 text-neutral-500">
              <div
                className="h-3.5 w-3.5 rounded-full border border-emerald-400"
                style={{
                  backgroundImage: `conic-gradient(#34D399 ${props.percentThresholdMet}%, transparent ${props.percentThresholdMet}% 100%)`,
                }}
              />
              <div className="text-xs">
                {abbreviateNumber(props.quorumRemainder, undefined, {
                  maximumFractionDigits: 0,
                })}{' '}
                more
              </div>
            </div>
          )}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="p-3 bg-white rounded shadow-xl w-64"
          side="top"
        >
          <HoverCard.Arrow className="fill-white" />
          <div className="flex items-center text-neutral-900 text-xs font-bold gap-x-1 mb-4">
            <ScalesTippedIcon className="h-4 w-4 fill-current" />
            {props.threholdPercent ? `${props.threholdPercent}% ` : ''}
            Community Threshold
          </div>
          {props.percentThresholdMet !== null && (
            <div className="flex items-center space-x-1 text-neutral-900 mb-3">
              <div
                className="h-3.5 w-3.5 rounded-full border border-emerald-400"
                style={{
                  backgroundImage: `conic-gradient(#34D399 ${props.percentThresholdMet}%, transparent ${props.percentThresholdMet}% 100%)`,
                }}
              />
              <div className="text-xs">
                {props.percentThresholdMet.toFixed(1)}% reached
              </div>
            </div>
          )}
          <div className="text-xs text-neutral-700">
            Proposals must reach a minimum number of 'Yes' votes before they are
            eligible to pass. If the minimum is reached but there are more 'No'
            votes when voting ends the proposal will fail.
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
