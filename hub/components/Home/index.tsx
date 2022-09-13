import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import { HomeLayout } from '@hub/components/HomeLayout';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import { getDefaultBannerUrl } from '@hub/lib/getDefaultBannerUrl';
import * as RE from '@hub/types/Result';

import * as Feed from './Feed';
import { getRealm, getRealmResp } from './gql';
import * as Sidebar from './Sidebar';

interface Props {
  className?: string;
  realm: PublicKey;
  realmUrlId: string;
}

export function Home(props: Props) {
  const [result] = useQuery(getRealmResp, {
    query: getRealm,
    variables: { realm: props.realm.toBase58() },
  });

  return (
    <main className={cx(props.className)}>
      {pipe(
        result,
        RE.match(
          () => (
            <HomeLayout
              error
              sidebar={() => <Sidebar.Error />}
              content={() => <div />}
            />
          ),
          () => (
            <HomeLayout
              loading
              sidebar={() => <Sidebar.Loading />}
              content={() => <div />}
            />
          ),
          ({ realm }) => (
            <HomeLayout
              bannerUrl={
                realm.bannerImageUrl || getDefaultBannerUrl(realm.publicKey)
              }
              sidebar={(isStickied) => (
                <Sidebar.Content
                  compressed={isStickied}
                  description={null}
                  iconUrl={realm.iconUrl}
                  membersCount={realm.membersCount}
                  realm={realm.publicKey}
                  realmName={realm.name}
                  realmUrlId={props.realmUrlId}
                  twitterHandle={realm.twitterHandle}
                  websiteUrl={realm.websiteUrl}
                />
              )}
              content={() => (
                <Feed.Content
                  className="pt-8"
                  realm={realm.publicKey}
                  realmIconUrl={realm.iconUrl}
                  realmName={realm.name}
                  realmUrlId={props.realmUrlId}
                />
              )}
            />
          ),
        ),
      )}
    </main>
  );
}
