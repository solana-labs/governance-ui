import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import * as Separater from '@radix-ui/react-separator';
import { BigNumber } from 'bignumber.js';

import { FeedItemProposal } from '../../gql';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { ProposalUserVoteType } from '@hub/types/ProposalUserVoteType';

import { Quorum } from './Quorum';

interface Props {
  className?: string;
  proposal: FeedItemProposal;
}

export function Proposal(props: Props) {
  const proposal = props.proposal.proposal;
  const voteBreakdown = proposal.voteBreakdown;

  const totalYesWeight = voteBreakdown.totalYesWeight;
  const totalNoWeight = voteBreakdown.totalNoWeight;
  const totalVotesCast = totalYesWeight.plus(totalNoWeight);
  const yesPercent = totalVotesCast.isZero()
    ? '0'
    : totalYesWeight.dividedBy(totalVotesCast).multipliedBy(100).toFormat(1);
  const noPercent = totalVotesCast.isZero()
    ? '0'
    : totalNoWeight.dividedBy(totalVotesCast).multipliedBy(100).toFormat(1);
  const quorumReached = (voteBreakdown.percentThresholdMet || 0) >= 100;
  const quorumRemainder = quorumReached
    ? new BigNumber(0)
    : voteBreakdown.threshold
    ? voteBreakdown.threshold
        .minus(voteBreakdown.totalYesWeight)
        .decimalPlaces(0, BigNumber.ROUND_UP)
    : new BigNumber(0);
  const myVote = props.proposal.proposal.myVote;

  return (
    <div
      className={cx(props.className, 'rounded', 'border', 'border-neutral-300')}
    >
      <div
        className={cx('h-16', 'py-2.5', 'px-4', 'grid', 'place-items-center')}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="text-xs text-neutral-900 w-6">Yes</div>
            <div className="text-xs text-neutral-500 ml-1">
              {formatNumber(totalYesWeight, undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            {myVote?.type === ProposalUserVoteType.Yes && (
              <CheckmarkIcon className="h-4 w-4 ml-1.5 fill-neutral-900" />
            )}
          </div>
          <div className="text-xs text-neutral-900">{yesPercent}%</div>
        </div>
        <div className="grid grid-cols-[1fr,120px] h-4 gap-x-2 w-full">
          <div className="relative h-full">
            <div
              className="absolute rounded-sm bg-emerald-400 h-1 top-1/2 left-0 -translate-y-1/2"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-end">
            <Quorum
              percentThresholdMet={voteBreakdown.percentThresholdMet}
              quorumReached={quorumReached}
              quorumRemainder={quorumRemainder}
              threholdPercent={voteBreakdown.voteThresholdPercentage}
              totalVotesCast={totalVotesCast}
            />
          </div>
        </div>
      </div>
      <Separater.Root className="h-[1px] w-full bg-neutral-300" />
      <div
        className={cx('h-16', 'py-2.5', 'px-4', 'grid', 'place-items-center')}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="text-xs text-neutral-900 w-6">No</div>
            <div className="text-xs text-neutral-500 ml-1">
              {formatNumber(totalNoWeight, undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            {myVote?.type === ProposalUserVoteType.No && (
              <CheckmarkIcon className="h-4 w-4 ml-1.5 fill-neutral-900" />
            )}
          </div>
          <div className="text-xs text-neutral-900">{noPercent}%</div>
        </div>
        <div className="grid grid-cols-[1fr,120px] h-4 gap-x-2 w-full">
          <div className="relative h-full">
            <div
              className="absolute rounded-sm bg-rose-500 h-1 top-1/2 left-0 -translate-y-1/2"
              style={{ width: `${noPercent}%` }}
            />
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}
