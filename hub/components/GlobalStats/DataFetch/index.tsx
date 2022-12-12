import * as Progress from '@radix-ui/react-progress';
import { ProgramAccount, Proposal, VoteRecord } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { fetchData, Update } from '../data';
import type { Logger } from '../Logs';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

interface Props {
  className?: string;
  connection: Connection;
  logger: Logger;
  runCount: number;
  onComplete?(): void;
  onMembersComplete?(members: Set<string>): void;
  onNFTRealms?(realms: PublicKey[]): void;
  onNFTRealmsComplete?(realm: PublicKey[]): void;
  onProposalsComplete?(proposals: ProgramAccount<Proposal>[]): void;
  onRealmsComplete?(realms: PublicKey[]): void;
  onTVLComplete?(amount: number): void;
  onVoteRecordsComplete?(voteRecords: ProgramAccount<VoteRecord>[]): void;
}

export function DataFetch(props: Props) {
  const [progress, setProgress] = useState<Update>({
    progress: 0,
    text: '',
    title: 'Ready',
  });

  useEffect(() => {
    if (props.runCount) {
      fetchData(props.connection, props.logger, {
        onComplete: props.onComplete,
        onMembersComplete: props.onMembersComplete,
        onNFTRealms: props.onNFTRealms,
        onNFTRealmsComplete: props.onNFTRealmsComplete,
        onProposalsComplete: props.onProposalsComplete,
        onRealmsComplete: props.onRealmsComplete,
        onTVLComplete: props.onTVLComplete,
        onUpdate: setProgress,
        onVoteRecordsComplete: props.onVoteRecordsComplete,
      });
    }
  }, [props.runCount]);

  return (
    <div className={props.className} key={props.runCount}>
      {progress.progress < 100 && (
        <>
          <div className="text-2xl text-neutral-900 mb-1">{progress.title}</div>
          <Progress.Root
            className="h-10 rounded overflow-hidden w-full bg-neutral-200 relative"
            value={progress.progress}
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
                right: `${100 - progress.progress}%`,
              }}
            />
            <div
              className="absolute text-sm leading-[40px] text-neutral-900 transition-all"
              style={{
                right: `${Math.max(100 - progress.progress, 6)}%`,
                transform: 'translateX(150%)',
              }}
            >
              {formatNumber(progress.progress, undefined, {
                maximumFractionDigits: 0,
              })}
              %
            </div>
          </Progress.Root>
          <div className="text-sm text-neutral-500">{progress.text}</div>
        </>
      )}
    </div>
  );
}
