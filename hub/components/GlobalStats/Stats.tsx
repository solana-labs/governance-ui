import PlayIcon from '@carbon/icons-react/lib/Play';
import { ProgramAccount, Proposal, VoteRecord } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { formatDistanceToNowStrict } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

import * as Button from '@components/core/controls/Button';

import { DataFetch } from './DataFetch';
import { Logger, Logs } from './Logs';
import { NumMembers } from './NumMembers';
import { NumNFTRealms } from './NumNFTRealms';
import { NumProposals } from './NumProposals';
import { NumRealms } from './NumRealms';
import { NumVoteRecords } from './NumVoteRecords';
import { TotalValue } from './TotalValue';
import { ValueByDao } from './ValueByDao';

interface Props {
  className?: string;
}

export function Stats(props: Props) {
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [realms, setRealms] = useState<PublicKey[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [valueByDao, setValueByDao] = useState<{
    [dao: string]: number;
  }>({});
  const [valueByDaoAndTokens, setValueByDaoAndTokens] = useState<{
    [name: string]: {
      [token: string]: number;
    };
  }>({});
  const [nftRealms, setNFTRealms] = useState<PublicKey[]>([]);
  const [duration, setDuration] = useState('');
  const [proposals, setProposals] = useState<ProgramAccount<Proposal>[]>([]);
  const [members, setMembers] = useState<Set<string>>(new Set());
  const [voteRecords, setVoteRecords] = useState<ProgramAccount<VoteRecord>[]>(
    [],
  );
  const [donefetchingNFTs, setDoneFetchingNFTs] = useState(false);
  const timer = useRef<number | null>(null);
  const wakePrevent = useRef<any>(null);
  const connection = useRef(
    new Connection(process.env.NEXT_PUBLIC_HELIUS_MAINNET_RPC || '', 'recent'),
  );
  const logger = useRef(new Logger());

  useEffect(() => {
    if (typeof window !== 'undefined' && running) {
      const start = Date.now();
      setDuration(formatDistanceToNowStrict(start));

      timer.current = window.setInterval(() => {
        setDuration(formatDistanceToNowStrict(start));
      }, 1000);
    }

    return () => {
      if (timer.current && typeof window !== 'undefined') {
        window.clearInterval(timer.current);
      }
    };
  }, [running]);

  useEffect(() => {
    return () => {
      if (wakePrevent.current) {
        wakePrevent.current.release();
      }
    };
  }, []);

  return (
    <article className={props.className}>
      <div className="mx-auto max-w-4xl py-48 px-4">
        <div className="flex items-center justify-center">
          <h1 className="text-neutral-900 text-4xl font-normal">
            Global Stats
          </h1>
          <Button.Primary
            className="ml-4"
            disabled={running}
            onClick={async () => {
              try {
                // @ts-ignore
                wakePrevent.current = navigator.wakeLock.request('screen');
              } catch (e) {
                console.error(e);
                // pass
              }

              setRunCount((count) => count + 1);
              setRunning(true);
            }}
          >
            <PlayIcon className="h-4 w-4 mr-1" />
            Run
          </Button.Primary>
        </div>
        {duration && (
          <div className="mt-2 text-sm text-neutral-500 text-center">
            Time elapsed: {duration}
          </div>
        )}
        <NumRealms realms={realms} />
        <NumNFTRealms fetching={!donefetchingNFTs} realms={nftRealms} />
        <TotalValue value={totalValue} />
        <ValueByDao
          valueByDao={valueByDao}
          valueByDaoAndTokens={valueByDaoAndTokens}
        />
        <NumProposals proposals={proposals} />
        <NumVoteRecords voteRecords={voteRecords} />
        <NumMembers members={members} />
        <DataFetch
          className="mt-10"
          connection={connection.current}
          logger={logger.current}
          onComplete={() => {
            if (wakePrevent?.current?.release) {
              wakePrevent.current.release();
            }

            if (timer?.current) {
              window.clearInterval(timer.current);
            }

            setRunning(false);
          }}
          onMembersComplete={setMembers}
          onNFTRealms={setNFTRealms}
          onNFTRealmsComplete={(realms) => {
            setNFTRealms(realms);
            setDoneFetchingNFTs(true);
          }}
          onProposalsComplete={setProposals}
          onRealmsComplete={setRealms}
          onTVLComplete={(total, byDao, byDaosAndTokens) => {
            setTotalValue(total);
            setValueByDao(byDao);
            setValueByDaoAndTokens(byDaosAndTokens);
          }}
          onVoteRecordsComplete={setVoteRecords}
          runCount={runCount}
        />
        <Logs className="mt-10" logger={logger.current} />
      </div>
    </article>
  );
}
