import { pipe } from 'fp-ts/function';
import Head from 'next/head';

import * as RealmHeader from '@hub/components/RealmHeader';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as Feed from './Feed';
import { getRealm, getRealmResp } from './gql';

interface Props {
  className?: string;
  realmUrlId: string;
}

export function Home(props: Props) {
  const [result] = useQuery(getRealmResp, {
    query: getRealm,
    variables: { urlId: props.realmUrlId },
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
          ({ realmByUrlId }) => (
            <div>
              <Head>
                <title>{realmByUrlId.name}</title>
                <meta
                  property="og:title"
                  content={realmByUrlId.name}
                  key="title"
                />
              </Head>
              <RealmHeader.Content
                bannerUrl={realmByUrlId.bannerImageUrl}
                iconUrl={realmByUrlId.iconUrl}
                name={realmByUrlId.name}
                realm={realmByUrlId.publicKey}
                realmUrlId={props.realmUrlId}
                selectedTab="feed"
                token={realmByUrlId.token}
                twitterHandle={realmByUrlId.twitterHandle}
                userIsAdmin={realmByUrlId.amAdmin}
                websiteUrl={realmByUrlId.websiteUrl}
                discordUrl={realmByUrlId.discordUrl}
                githubUrl={realmByUrlId.githubUrl}
                instagramUrl={realmByUrlId.instagramUrl}
                linkedInUrl={realmByUrlId.linkedInUrl}
              />
              <Feed.Content
                className="max-w-3xl mx-auto pt-8 w-full px-4"
                realm={realmByUrlId.publicKey}
                realmIconUrl={realmByUrlId.iconUrl}
                realmName={realmByUrlId.name}
                realmUrlId={props.realmUrlId}
              />
            </div>
          ),
        ),
      )}
    </main>
  );
}
