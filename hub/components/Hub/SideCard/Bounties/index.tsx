import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';

import { abbreviateNumber } from '@hub/lib/abbreviateNumber';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  realmUrlId: string;
}

interface BountyData {
  'objectID': string;
  'Name': string;
  'type': string;
  'Opportunity Title': string;
  'Opportunity Description': string;
  'Total Value in USD': number;
}

export function Bounties(props: Props) {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = `https://earn.superteamearn.workers.dev/?key=${props.realmUrlId.toLowerCase()}`;
      const res = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();

      if (res.ok) {
        try {
          const listing = JSON.parse(json.data.value);
          setBounties(listing);
        } catch {
          setBounties([]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className={props.className}>
      {!bounties.length && (
        <div className="my-4 text-sm text-center text-neutral-500">
          {loading ? 'Loading data...' : 'There are no bounties.'}
        </div>
      )}
      {bounties.map((bounty: BountyData, i) => {
        return (
          <button
            className={cx(
              'gap-x-3',
              'grid-cols-[20px,1fr]',
              'grid',
              'group',
              'overflow-hidden',
              'text-left',
              'tracking-normal',
              'w-full',
            )}
            key={bounty.objectID}
            onClick={() => {
              const url = `https://earn.superteam.fun/${bounty.type.toLowerCase()}/${
                bounty.objectID
              }`;
              window.open(url, '_blank');
            }}
          >
            <div className="text-xs font-medium leading-6 text-neutral-900">
              {(i + 1).toString().padStart(2, '0')}
            </div>
            <div>
              <div
                className={cx(
                  'font-bold',
                  'text-neutral-900',
                  'transition-colors',
                  'truncate',
                  'group-hover:text-sky-500',
                )}
              >
                {bounty['Opportunity Title']}
              </div>
              <div className="flex items-center mt-1">
                Prize Pool: ${abbreviateNumber(bounty['Total Value in USD'])}
              </div>
            </div>
          </button>
        );
      })}
      <Link
        passHref
        href={`https://earn.superteam.fun/opportunities/category/bounties`}
      >
        <a
          className={cx(
            'flex',
            'h-8',
            'items-center',
            'justify-center',
            'text-neutral-500',
            'text-xs',
            'w-full',
            'hover:text-sky-500',
          )}
        >
          <div className="transition-colors">All bounties</div>
          <ChevronRightIcon className="fill-current h-3 w-3 ml-1.5 transition-colors" />
        </a>
      </Link>
    </div>
  );
}
