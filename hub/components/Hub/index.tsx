import { pipe } from 'fp-ts/function';
import Head from 'next/head';
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
  realmUrlId: string;
}

export function Hub(props: Props) {
  const [result] = useQuery(gql.getHubResp, {
    query: gql.getHub,
    variables: { urlId: props.realmUrlId },
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
          ({ realmByUrlId }) => (
            <div className="pb-28">
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
                selectedTab="hub"
                token={realmByUrlId.token}
                twitterHandle={realmByUrlId.twitterHandle}
                userIsAdmin={realmByUrlId.amAdmin}
                websiteUrl={realmByUrlId.websiteUrl}
                discordUrl={realmByUrlId.discordUrl}
                githubUrl={realmByUrlId.githubUrl}
                instagramUrl={realmByUrlId.instagramUrl}
                linkedInUrl={realmByUrlId.linkedInUrl}
              />
              <div className="max-w-7xl mx-auto relative w-full">
                {realmByUrlId.heading && (
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
                    document={realmByUrlId.heading}
                  />
                )}
                <div className="mt-8 px-4 md:px-8">
                  <Stats
                    category={realmByUrlId.category}
                    documentation={realmByUrlId.documentation}
                    numMembers={realmByUrlId.membersCount}
                    realm={realmByUrlId.publicKey}
                    realmUrlId={props.realmUrlId}
                    twitterFollowers={realmByUrlId.twitterFollowerCount}
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
                        className="mb-14 max-w-lg mx-auto"
                        realm={realmByUrlId.publicKey}
                        realmUrlId={props.realmUrlId}
                      />
                    </div>
                  )}
                  <div>
                    <About sections={realmByUrlId.about} />
                    {realmByUrlId.resources.length > 0 && (
                      <>
                        <Divider
                          className="mt-14 mb-10"
                          iconUrl={realmByUrlId.iconUrl}
                          name={realmByUrlId.name}
                        />
                        <ResourceList resources={realmByUrlId.resources} />
                      </>
                    )}
                  </div>
                  {isTwoColLayout && (
                    <div>
                      <SideCard
                        className="sticky top-24"
                        realm={realmByUrlId.publicKey}
                        realmUrlId={props.realmUrlId}
                      />
                    </div>
                  )}
                </div>
              </div>
              {realmByUrlId.gallery.length > 0 && (
                <Gallery className="mt-20" items={realmByUrlId.gallery} />
              )}
              <div className="max-w-7xl mx-auto relative w-full">
                {realmByUrlId.team.length > 0 && (
                  <Team
                    className="mt-14 px-4 md:px-8"
                    teamMembers={realmByUrlId.team}
                  />
                )}
                {realmByUrlId.roadmap.items.length > 0 && (
                  <Roadmap
                    className="mt-24 px-8"
                    description={realmByUrlId.roadmap.description}
                    icon={realmByUrlId.iconUrl}
                    items={realmByUrlId.roadmap.items}
                    name={realmByUrlId.name}
                  />
                )}
                {realmByUrlId.faq.length > 0 && (
                  <Faq
                    className="mt-24 max-w-6xl mx-auto"
                    items={realmByUrlId.faq}
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
