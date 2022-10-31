import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';
import { useMediaQuery } from 'react-responsive';

import * as RealmHeader from '@hub/components/RealmHeader';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import { About } from './About';
import { Divider } from './Divider';
import { Faq } from './Faq';
import { Gallery } from './Gallery';
import * as gql from './gql';
import { ResourceList } from './ResourceList';
import { Roadmap } from './Roadmap';
import { SideCard } from './SideCard';
import { Stats } from './Stats';
import { Team } from './Team';

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
  const isTwoColLayout = useMediaQuery({ query: '(min-width:1024px)' });

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
            <div className="pb-28">
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
                discordUrl={realm.discordUrl}
                githubUrl={realm.githubUrl}
                instagramUrl={realm.instagramUrl}
                linkedInUrl={realm.linkedInUrl}
              />
              <div className="max-w-7xl mx-auto relative w-full">
                {hub.info.heading && (
                  <RichTextDocumentDisplay
                    className={cx(
                      'mt-8',
                      'font-medium',
                      'text-neutral-500',
                      'max-w-5xl',
                      'px-4',
                      'text-xl',
                      'md:px-8',
                      'md:text-3xl',
                    )}
                    document={hub.info.heading}
                  />
                )}
                <div className="mt-8 px-4 md:px-8">
                  <Stats
                    category={realm.category}
                    documentation={hub.info.documentation}
                    numMembers={realm.membersCount}
                    realm={props.realm}
                    realmUrlId={props.realmUrlId}
                    twitterFollowers={hub.twitterFollowerCount}
                  />
                </div>
                <div
                  className={cx(
                    'mt-16',
                    'px-4',
                    'lg:gap-x-12',
                    'lg:grid-cols-[1fr,450px]',
                    'lg:grid',
                    'md:px-8',
                  )}
                >
                  {!isTwoColLayout && (
                    <div>
                      <SideCard
                        className="mb-14"
                        realm={props.realm}
                        realmUrlId={props.realmUrlId}
                      />
                    </div>
                  )}
                  <div>
                    <About sections={hub.info.about} />
                    {hub.info.resources.length > 0 && (
                      <>
                        <Divider
                          className="mt-14 mb-10"
                          iconUrl={realm.iconUrl}
                          name={realm.name}
                        />
                        <ResourceList resources={hub.info.resources} />
                      </>
                    )}
                  </div>
                  {isTwoColLayout && (
                    <div>
                      <SideCard
                        className="sticky top-24"
                        realm={props.realm}
                        realmUrlId={props.realmUrlId}
                      />
                    </div>
                  )}
                </div>
              </div>
              {hub.info.gallery.length > 0 && (
                <Gallery className="mt-20" items={hub.info.gallery} />
              )}
              <div className="max-w-7xl mx-auto relative w-full">
                {hub.info.team.length > 0 && (
                  <Team
                    className="mt-14 px-4 md:px-8"
                    teamMembers={hub.info.team}
                  />
                )}
                {hub.info.roadmap.items.length > 0 && (
                  <Roadmap
                    className="mt-24 px-8"
                    description={hub.info.roadmap.description}
                    icon={realm.iconUrl}
                    items={hub.info.roadmap.items}
                    name={realm.name}
                  />
                )}
                {hub.info.faq.length > 0 && (
                  <Faq
                    className="mt-24 max-w-6xl mx-auto"
                    items={hub.info.faq}
                  />
                )}
              </div>
            </div>
          ),
        ),
      )}
    </main>
  );
}
