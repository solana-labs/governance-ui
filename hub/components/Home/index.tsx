import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import * as RealmHeader from '@hub/components/RealmHeader';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as Feed from './Feed';
import { getRealm, getRealmResp } from './gql';

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
            <div>
              <RealmHeader.Error />
            </div>
          ),
          () => (
            <div>
              <RealmHeader.Loading />
            </div>
          ),
          ({ hub, realm }) => (
            <div>
              <RealmHeader.Content
                bannerUrl={realm.bannerImageUrl}
                iconUrl={realm.iconUrl}
                name={realm.name}
                realm={realm.publicKey}
                realmUrlId={props.realmUrlId}
                selectedTab="feed"
                token={hub.info.token}
                twitterHandle={realm.twitterHandle}
                websiteUrl={realm.websiteUrl}
                discordUrl={realm.discordUrl}
                githubUrl={realm.githubUrl}
                instagramUrl={realm.instagramUrl}
                linkedInUrl={realm.linkedInUrl}
              />
              <Feed.Content
                className="max-w-3xl mx-auto pt-8 w-full px-4"
                realm={realm.publicKey}
                realmIconUrl={realm.iconUrl}
                realmName={realm.name}
                realmUrlId={props.realmUrlId}
              />
            </div>
          ),
        ),
      )}
    </main>
  );
}
