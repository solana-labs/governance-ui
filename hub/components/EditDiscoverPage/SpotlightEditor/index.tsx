import { produce } from 'immer';
import { useEffect, useState } from 'react';

import { SpotlightItem } from '../gql';
import { Input } from '@hub/components/controls/Input';
import { Textarea } from '@hub/components/controls/Textarea';
import { LargeCard } from '@hub/components/DiscoverPage/LargeCard';
import { RealmSearchSelector } from '@hub/components/RealmSearchSelector';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  value: SpotlightItem;
  onChange?(value: SpotlightItem): void;
}

export function SpotlightEditor(props: Props) {
  const [stats, setStats] = useState<SpotlightItem['stats']>([]);

  useEffect(() => {
    const newStats = [
      {
        value: '',
        label: '',
      },
      {
        value: '',
        label: '',
      },
      {
        value: '',
        label: '',
      },
    ];

    props.value.stats.forEach((stat, i) => {
      newStats[i] = stat;
    });

    setStats(newStats);
  }, [props.value]);

  return (
    <div
      className={cx(
        props.className,
        'grid',
        'grid-cols-2',
        'items-start',
        'gap-x-4',
      )}
    >
      <LargeCard
        className="bg-white"
        content={<div>{props.value.description}</div>}
        imgSrc={props.value.heroImageUrl}
        publicKey={props.value.publicKey}
        stats={props.value.stats}
        title={props.value.title}
        urlId={props.value.realm.urlId}
      />
      <div className="space-y-4">
        <div>
          <div
            className={cx('font-bold', 'm-0', 'text-base', 'text-neutral-700')}
          >
            Hero Image Url
          </div>
          <Input
            className="w-full h-[42px] rounded"
            value={props.value.heroImageUrl}
            onChange={(e) => {
              const text = e.currentTarget.value;
              const newValue = produce(props.value, (data) => {
                data.heroImageUrl = text;
              });
              props.onChange?.(newValue);
            }}
          />
        </div>
        <div>
          <div
            className={cx('font-bold', 'm-0', 'text-base', 'text-neutral-700')}
          >
            Title
          </div>
          <Input
            className="w-full h-[42px] rounded"
            value={props.value.title}
            onChange={(e) => {
              const text = e.currentTarget.value;
              const newValue = produce(props.value, (data) => {
                data.title = text;
              });
              props.onChange?.(newValue);
            }}
          />
        </div>
        <div>
          <div
            className={cx('font-bold', 'm-0', 'text-base', 'text-neutral-700')}
          >
            PublicKey
          </div>
          <div className="flex space-x-4 items-center">
            <RealmSearchSelector
              selected={props.value.publicKey}
              onSelect={(realm) => {
                if (realm) {
                  const newValue = produce(props.value, (data) => {
                    data.publicKey = realm.publicKey;
                    data.realm.urlId = realm.urlId;
                  });
                  props.onChange?.(newValue);
                }
              }}
            />
            <div className="h-[42px] rounded leading-[42px]">
              {abbreviateAddress(props.value.publicKey)}
            </div>
          </div>
        </div>
        <div>
          <div
            className={cx('font-bold', 'm-0', 'text-base', 'text-neutral-700')}
          >
            Description
          </div>
          <Textarea
            className="w-full h-24 rounded"
            value={props.value.description}
            onChange={(e) => {
              const text = e.currentTarget.value;
              const newValue = produce(props.value, (data) => {
                data.description = text;
              });
              props.onChange?.(newValue);
            }}
          />
        </div>
        <div>
          <div
            className={cx('font-bold', 'm-0', 'text-base', 'text-neutral-700')}
          >
            Stats
          </div>
          <div className="grid grid-cols-3 gap-x-4">
            {stats.map((stat, i) => (
              <div className="space-y-2">
                <Input
                  className="h-[42px] rounded w-full"
                  value={stat.value}
                  onChange={(e) => {
                    const text = e.currentTarget.value;
                    const newStats = produce(stats, (data) => {
                      data[i].value = text;
                    });
                    const newValue = produce(props.value, (data) => {
                      data.stats = newStats;
                    });
                    props.onChange?.(newValue);
                  }}
                />
                <Input
                  className="h-[42px] rounded w-full"
                  value={stat.label}
                  onChange={(e) => {
                    const text = e.currentTarget.value;
                    const newStats = produce(stats, (data) => {
                      data[i].label = text;
                    });
                    const newValue = produce(props.value, (data) => {
                      data.stats = newStats;
                    });
                    props.onChange?.(newValue);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
