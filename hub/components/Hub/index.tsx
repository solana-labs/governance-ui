import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import * as RealmHeader from '@hub/components/RealmHeader';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useQuery } from '@hub/hooks/useQuery';
import * as RE from '@hub/types/Result';

import { About } from './About';
import * as gql from './gql';
import { SideCard } from './SideCard';
import { Stats } from './Stats';

interface Props {
  className?: string;
  realm: PublicKey;
  realmUrlId: string;
}

export function Hub(props: Props) {
  const [result] = useQuery(gql.getHubResp, {
    query: gql.getHub,
    variables: { realm: props.realm.toBase58() },
  });

  return (
    <main className={props.className}>
      {pipe(
        result,
        RE.match(
          () => (
            <div>
              <RealmHeader.Error />
              <div className="mt-8 text-3xl font-medium w-96">&nbsp;</div>
            </div>
          ),
          () => (
            <div>
              <RealmHeader.Loading />
              <div className="mt-8 text-3xl font-medium w-96">&nbsp;</div>
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
                selectedTab="hub"
                token={hub.info.token}
                twitterHandle={realm.twitterHandle}
                websiteUrl={realm.websiteUrl}
              />
              <div className="max-w-7xl mx-auto px-8 relative w-full">
                {hub.info.heading && (
                  <RichTextDocumentDisplay
                    className="mt-8 text-3xl font-medium text-neutral-500"
                    document={hub.info.heading}
                  />
                )}
                <Stats
                  className="mt-8"
                  documentation={hub.info.documentation}
                  numMembers={realm.membersCount}
                  realm={props.realm}
                  realmUrlId={props.realmUrlId}
                  twitterFollowers={hub.twitterFollowerCount}
                />
                <div className="grid grid-cols-[1fr,450px] gap-x-12 mt-16">
                  <div>
                    <About sections={hub.info.about} />
                  </div>
                  <div>
                    <SideCard
                      realm={props.realm}
                      realmUrlId={props.realmUrlId}
                    />
                  </div>
                </div>
              </div>
            </div>
          ),
        ),
      )}
    </main>
  );
}
