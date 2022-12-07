import * as HoverCard from '@radix-ui/react-hover-card';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';

import { SmallCard } from '@hub/components/DiscoverPage/SmallCard';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  asChild?: boolean;
  children: JSX.Element;
  className?: string;
  publicKey: PublicKey;
}

export function RealmHovercard(props: Props) {
  const { asChild, children, className } = props;
  const [shouldFetch, setShouldFetch] = useState(false);
  const [open, setOpen] = useState(false);

  const [result] = useQuery(gql.getRealmResp, {
    query: gql.getRealm,
    variables: { publicKey: props.publicKey },
    pause: shouldFetch,
  });

  useEffect(() => {
    if (open) {
      setShouldFetch(true);
    }
  }, [open]);

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen}>
      <HoverCard.Trigger asChild={asChild}>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className={cx('drop-shadow-xl', 'rounded', 'z-40', className)}
          side="top"
          sideOffset={8}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <HoverCard.Arrow className="fill-white" />
          {pipe(
            result,
            RE.match(
              () => <div />,
              () => <div />,
              ({ realm }) => (
                <SmallCard
                  className="w-72"
                  bannerImgSrc={realm.bannerImageUrl}
                  category={realm.category}
                  description={realm.shortDescription}
                  heading={realm.clippedHeading}
                  iconImgSrc={realm.iconUrl}
                  name={realm.name}
                  publicKey={realm.publicKey}
                  twitterFollowerCount={realm.twitterFollowerCount}
                  urlId={realm.urlId}
                />
              ),
            ),
          )}
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
