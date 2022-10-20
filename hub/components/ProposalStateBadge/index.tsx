import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import CloseIcon from '@carbon/icons-react/lib/Close';
import DocumentSignedIcon from '@carbon/icons-react/lib/DocumentSigned';
import OverflowMenuHorizontalIcon from '@carbon/icons-react/lib/OverflowMenuHorizontal';
import PenFountainIcon from '@carbon/icons-react/lib/PenFountain';
import PlayOutlineIcon from '@carbon/icons-react/lib/PlayOutline';
import ScalesTippedIcon from '@carbon/icons-react/lib/ScalesTipped';
import ThumbsDownFilledIcon from '@carbon/icons-react/lib/ThumbsDownFilled';
import ThumbsUpFilledIcon from '@carbon/icons-react/lib/ThumbsUpFilled';
import TimerIcon from '@carbon/icons-react/lib/Timer';
import WarningIcon from '@carbon/icons-react/lib/Warning';
import { intervalToDuration } from 'date-fns';
import { cloneElement, useEffect, useState } from 'react';

import cx from '@hub/lib/cx';
import { formatDuration } from '@hub/lib/formatDuration';
import { ProposalState } from '@hub/types/ProposalState';

function getBackground(state: ProposalState, voteSubmitted?: boolean) {
  switch (state) {
    case ProposalState.Cancelled:
      return 'bg-transparent';
    case ProposalState.Completed:
      return 'bg-white';
    case ProposalState.Defeated:
      return 'bg-white';
    case ProposalState.Draft:
      return 'bg-transparent';
    case ProposalState.Executable:
      return 'bg-sky-500';
    case ProposalState.ExecutingWithErrors:
      return 'bg-red-500';
    case ProposalState.Finalizing:
      return 'bg-white';
    case ProposalState.SigningOff:
      return 'bg-transparent';
    case ProposalState.Voting:
      return voteSubmitted ? 'bg-white' : 'bg-emerald-400';
  }
}

function getBorder(state: ProposalState) {
  switch (state) {
    case ProposalState.Cancelled:
      return 'border border-neutral-500';
    case ProposalState.Completed:
      return 'border-none';
    case ProposalState.Defeated:
      return 'border-none';
    case ProposalState.Draft:
      return 'border border-neutral-500';
    case ProposalState.Executable:
      return 'border-none';
    case ProposalState.ExecutingWithErrors:
      return 'border-none';
    case ProposalState.Finalizing:
      return 'border-none';
    case ProposalState.SigningOff:
      return 'border border-neutral-500';
    case ProposalState.Voting:
      return 'border-none';
  }
}

function getColor(state: ProposalState) {
  switch (state) {
    case ProposalState.Cancelled:
      return 'text-neutral-500';
    case ProposalState.Completed:
      return 'text-emerald-500';
    case ProposalState.Defeated:
      return 'text-rose-500';
    case ProposalState.Draft:
      return 'text-neutral-500';
    case ProposalState.Executable:
      return 'text-neutral-50';
    case ProposalState.ExecutingWithErrors:
      return 'text-neutral-50';
    case ProposalState.Finalizing:
      return 'text-sky-500';
    case ProposalState.SigningOff:
      return 'text-orange-500';
    case ProposalState.Voting:
      return 'text-neutral-900';
  }
}

function getIcon(state: ProposalState, voteSubmitted?: boolean) {
  switch (state) {
    case ProposalState.Cancelled:
      return <CloseIcon />;
    case ProposalState.Completed:
      return <ThumbsUpFilledIcon />;
    case ProposalState.Defeated:
      return <ThumbsDownFilledIcon />;
    case ProposalState.Draft:
      return <DocumentSignedIcon />;
    case ProposalState.Executable:
      return <PlayOutlineIcon />;
    case ProposalState.ExecutingWithErrors:
      return <WarningIcon />;
    case ProposalState.Finalizing:
      return <OverflowMenuHorizontalIcon />;
    case ProposalState.SigningOff:
      return <PenFountainIcon />;
    case ProposalState.Voting:
      return voteSubmitted ? <CheckmarkIcon /> : <ScalesTippedIcon />;
  }
}

function getLabel(state: ProposalState, voteSubmitted?: boolean) {
  switch (state) {
    case ProposalState.Cancelled:
      return 'Cancelled';
    case ProposalState.Completed:
      return 'Completed';
    case ProposalState.Defeated:
      return 'Defeated';
    case ProposalState.Draft:
      return 'Draft';
    case ProposalState.Executable:
      return 'Executable';
    case ProposalState.ExecutingWithErrors:
      return 'Executing w/ errors';
    case ProposalState.Finalizing:
      return 'Finalizing';
    case ProposalState.SigningOff:
      return 'Signing off';
    case ProposalState.Voting:
      return voteSubmitted ? 'Voted' : 'Vote Now';
  }
}

interface Props {
  className?: string;
  state: ProposalState;
  votingEnds?: number;
  voteSubmitted?: boolean;
}

export function ProposalStateBadge(props: Props) {
  const [duration, setDuration] = useState(
    props.votingEnds
      ? formatDuration(
          intervalToDuration({
            start: Date.now(),
            end: props.votingEnds,
          }),
          { short: true },
        )
      : '',
  );

  useEffect(() => {
    let timer = 0;

    if (
      props.state === ProposalState.Voting &&
      typeof window !== 'undefined' &&
      props.votingEnds
    ) {
      const votingEnds = props.votingEnds;

      timer = window.setInterval(
        () =>
          setDuration(
            formatDuration(
              intervalToDuration({
                start: Date.now(),
                end: votingEnds,
              }),
              { short: true },
            ),
          ),
        1000,
      );
    }

    return () => {
      if (timer && typeof window !== 'undefined') {
        window.clearInterval(timer);
      }
    };
  }, [props.state]);

  const icon = getIcon(props.state);

  return (
    <div className={cx(props.className, 'flex', 'items-center', 'space-x-2')}>
      {props.state === ProposalState.Voting && props.votingEnds && (
        <div className="flex items-center text-xs text-neutral-500 space-x-1">
          <TimerIcon className="fill-current h-4 w-4" />
          <div>{duration}</div>
        </div>
      )}
      <div
        className={cx(
          'flex',
          'items-center',
          'h-6',
          'px-2',
          'rounded',
          getBackground(props.state, props.voteSubmitted),
          getBorder(props.state),
          getColor(props.state),
        )}
      >
        {cloneElement(icon, {
          className: cx(
            icon.props.className,
            'fill-current',
            'h-4',
            'mr-1',
            'w-4',
          ),
        })}
        <div className="text-xs">
          {getLabel(props.state, props.voteSubmitted)}
        </div>
      </div>
    </div>
  );
}
