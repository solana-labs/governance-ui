import PlayIcon from '@carbon/icons-react/lib/Play';
import { Connection, PublicKey } from '@solana/web3.js';
import { formatDistanceToNowStrict } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

import * as Button from '@hub/components/controls/Button';

import { DataFetch } from './DataFetch';
import { Logger, Logs } from './Logs';
import { NumNFTRealms } from './NumNFTRealms';
import { NumRealms } from './NumRealms';
import { TotalValue } from './TotalValue';

interface Props {
  className?: string;
}

export function GlobalStats(props: Props) {
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [realms, setRealms] = useState<PublicKey[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [nftRealms, setNFTRealms] = useState<PublicKey[]>([]);
  const [duration, setDuration] = useState('');
  const [donefetchingNFTs, setDoneFetchingNFTs] = useState(false);
  const timer = useRef<number | null>(null);
  const connection = useRef(
    new Connection(
      'http://realms-realms-c335.mainnet.rpcpool.com/258d3727-bb96-409d-abea-0b1b4c48af29/',
      'recent',
    ),
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
            onClick={() => {
              setRunCount((count) => count + 1);
              setRunning(true);
            }}
          >
            <PlayIcon className="h-4 w-4 mr-1" />
            Run
          </Button.Primary>
        </div>
        {running && duration && (
          <div className="mt-2 text-sm text-neutral-500 text-center">
            Time elapsed: {duration}
          </div>
        )}
        <NumRealms realms={realms} />
        <NumNFTRealms fetching={!donefetchingNFTs} realms={nftRealms} />
        <TotalValue value={totalValue} />
        <DataFetch
          className="mt-10"
          connection={connection.current}
          logger={logger.current}
          runCount={runCount}
          onComplete={() => setRunning(false)}
          onNFTRealms={setNFTRealms}
          onNFTRealmsComplete={(realms) => {
            setNFTRealms(realms);
            setDoneFetchingNFTs(true);
          }}
          onRealmsComplete={setRealms}
          onTVLComplete={setTotalValue}
        />
        <Logs logger={logger.current} />
      </div>
    </article>
  );
}
