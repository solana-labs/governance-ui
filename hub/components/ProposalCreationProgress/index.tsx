import * as Progress from '@radix-ui/react-progress';
import React from 'react';

import {
  CreationProgress,
  CreationProgressState,
} from '@hub/hooks/useProposalCreationProgress';
import cx from '@hub/lib/cx';

function Modal(props: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cx(
        props.className,
        'fixed',
        'top-0',
        'left-0',
        'right-0',
        'bottom-0',
        'z-50',
        'bg-black/40',
      )}
    >
      <div
        className={cx(
          '-translate-x-1/2',
          '-translate-y-1/2',
          'absolute',
          'bg-neutral-800',
          'left-1/2',
          'max-w-3xl',
          'p-8',
          'rounded',
          'shadow-2xl',
          'top-1/2',
          'w-full',
        )}
      >
        {props.children}
      </div>
    </div>
  );
}

interface Props {
  className?: string;
  progress: CreationProgress;
}

export function ProposalCreationProgress(props: Props) {
  if (props.progress.state === CreationProgressState.Processing) {
    const progressValue =
      ((props.progress.transactionsCompleted + 1) /
        props.progress.totalTransactions) *
      100;

    return (
      <Modal className={props.className}>
        <div className="text-white">Creating proposal</div>
        <div className="mt-4">
          <Progress.Root
            className="h-10 rounded overflow-hidden w-full bg-neutral-200 relative"
            value={progressValue}
          >
            <Progress.Indicator
              className={cx(
                'absolute',
                'animate-move-stripes',
                'duration-700',
                'top-0',
                'bottom-0',
                'transition-all',
                'w-full',
              )}
              style={{
                background:
                  'repeating-linear-gradient(-67.5deg, #bae6fd, #bae6fd 20px, #7dd3fc 20px, #7dd3fc 40px)',
                right: `${100 - progressValue}%`,
              }}
            />
          </Progress.Root>
        </div>
        <div className="mt-2 text-sm text-neutral-500">
          Processing transaction{' '}
          <span className="font-bold">
            {props.progress.transactionsCompleted + 1}
          </span>{' '}
          of{' '}
          <span className="font-bold">{props.progress.totalTransactions}</span>
        </div>
      </Modal>
    );
  }

  return null;
}
