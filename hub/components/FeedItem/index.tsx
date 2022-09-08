import * as Separator from '@radix-ui/react-separator';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import * as Sidebar from '../Home/Sidebar';
import { HomeLayout } from '@hub/components/HomeLayout';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useQuery } from '@hub/hooks/useQuery';
import { getDefaultBannerUrl } from '@hub/lib/getDefaultBannerUrl';
import * as RE from '@hub/types/Result';

import * as Back from './Back';
import * as Footer from './Footer';
import * as gql from './gql';
import * as Header from './Header';
import * as Title from './Title';

interface Props {
  className?: string;
  feedItemId: string;
  realm: PublicKey;
  realmUrlId: string;
}

export function FeedItem(props: Props) {
  const [feedItemResult] = useQuery(gql.getFeedItemResp, {
    query: gql.getFeedItem,
    variables: {
      realm: props.realm,
      feedItemId: props.feedItemId,
    },
  });
  const [realmResult] = useQuery(gql.getRealmResp, {
    query: gql.getRealm,
    variables: { realm: props.realm },
  });

  return (
    <main className={props.className}>
      {pipe(
        realmResult,
        RE.match(
          () => (
            <HomeLayout
              error
              sidebar={() => <Sidebar.Error />}
              content={() => (
                <div className="pt-8">
                  <Back.Error className="mb-8 mt-4" />
                  <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                  <Header.Error className="mt-6" />
                  <Title.Error className="mt-5 mb-11" />
                  <div className="mb-16 rounded w-full h-20 bg-neutral-200" />
                  <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                  <Footer.Error className="mt-5" />
                </div>
              )}
            />
          ),
          () => (
            <HomeLayout
              loading
              sidebar={() => <Sidebar.Loading />}
              content={() => (
                <div className="pt-8">
                  <Back.Loading className="mb-8 mt-4" />
                  <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                  <Header.Loading className="mt-6" />
                  <Title.Loading className="mt-5 mb-11" />
                  <div className="mb-16 rounded w-full h-20 bg-neutral-200 animate-pulse" />
                  <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                  <Footer.Loading className="mt-5" />
                </div>
              )}
            />
          ),
          ({ realm }) => {
            return (
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
                content={() =>
                  pipe(
                    feedItemResult,
                    RE.match(
                      () => (
                        <div className="pt-8">
                          <Back.Error className="mb-8 mt-4" />
                          <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                          <Header.Error className="mt-6" />
                          <Title.Error className="mt-5 mb-11" />
                          <div className="mb-16 rounded w-full h-20 bg-neutral-200" />
                          <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                          <Footer.Error className="mt-5" />
                        </div>
                      ),
                      () => (
                        <div className="pt-8">
                          <Back.Loading className="mb-8 mt-4" />
                          <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                          <Header.Loading className="mt-6" />
                          <Title.Loading className="mt-5 mb-11" />
                          <div className="mb-16 rounded w-full h-20 bg-neutral-200 animate-pulse" />
                          <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                          <Footer.Loading className="mt-5" />
                        </div>
                      ),
                      ({ feedItem }) => (
                        <div className="pt-8">
                          <Back.Content className="mb-7 mt-4" />
                          <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                          <Header.Content
                            className="mt-6"
                            author={feedItem.author}
                            created={feedItem.created}
                            updated={feedItem.updated}
                          />
                          <Title.Content
                            className="mt-5 mb-11"
                            title={feedItem.title}
                          />
                          <RichTextDocumentDisplay
                            className="mb-16"
                            document={feedItem.document}
                          />
                          <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                          <Footer.Content
                            className="mt-5"
                            feedItemId={feedItem.id}
                            realm={props.realm}
                            score={feedItem.score}
                            userVote={feedItem.myVote}
                          />
                        </div>
                      ),
                    ),
                  )
                }
              />
            );
          },
        ),
      )}
    </main>
  );
}
