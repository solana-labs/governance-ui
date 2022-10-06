import * as Separator from '@radix-ui/react-separator';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';

import * as Sidebar from '../Home/Sidebar';
import * as Back from '@hub/components/FeedItem/Back';
import * as CommentTree from '@hub/components/FeedItem/CommentTree';
import * as Footer from '@hub/components/FeedItem/Footer';
import * as feedItemGql from '@hub/components/FeedItem/gql';
import * as Header from '@hub/components/FeedItem/Header';
import * as Title from '@hub/components/FeedItem/Title';
import { HomeLayout } from '@hub/components/HomeLayout';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useQuery } from '@hub/hooks/useQuery';
import { getDefaultBannerUrl } from '@hub/lib/getDefaultBannerUrl';
import * as RE from '@hub/types/Result';

import * as gql from './gql';
import * as ViewAllCommentsButton from './ViewAllCommentsButton';

interface Props {
  className?: string;
  commentId: string;
  feedItemId: string;
  realm: PublicKey;
  realmUrlId: string;
}

export function FeedItemComment(props: Props) {
  const [feedItemResult] = useQuery(feedItemGql.getFeedItemResp, {
    query: feedItemGql.getFeedItem,
    variables: {
      realm: props.realm,
      feedItemId: props.feedItemId,
    },
  });

  const [realmResult] = useQuery(feedItemGql.getRealmResp, {
    query: feedItemGql.getRealm,
    variables: { realm: props.realm },
  });

  const [commentResult] = useQuery(gql.getCommentResp, {
    query: gql.getComments,
    variables: { commentId: props.commentId, feedItemId: props.feedItemId },
  });

  return (
    <main className={props.className}>
      {pipe(
        realmResult,
        RE.match(
          () => (
            <HomeLayout
              error
              realm={props.realm}
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
              realm={props.realm}
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
          ({ realm }) => (
            <HomeLayout
              bannerUrl={
                realm.bannerImageUrl || getDefaultBannerUrl(realm.publicKey)
              }
              realm={props.realm}
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
                          numReplies={feedItem.numComments}
                          realm={props.realm}
                          score={feedItem.score}
                          userVote={feedItem.myVote}
                        />
                        {pipe(
                          commentResult,
                          RE.match(
                            () => (
                              <div className="pt-8">
                                <ViewAllCommentsButton.Error className="mb-8" />
                                <CommentTree.Error />
                              </div>
                            ),
                            () => (
                              <div className="pt-8">
                                <ViewAllCommentsButton.Loading className="mb-8" />
                                <CommentTree.Loading />
                              </div>
                            ),
                            ({ feedItemComment }) => (
                              <div className="pt-8 pb-16">
                                <ViewAllCommentsButton.Content
                                  className="mb-8"
                                  feedItemId={props.feedItemId}
                                  realmUrlId={props.realmUrlId}
                                />
                                <CommentTree.Content
                                  comments={[feedItemComment]}
                                  feedItemId={props.feedItemId}
                                  realm={props.realm}
                                  realmUrlId={props.realmUrlId}
                                />
                              </div>
                            ),
                          ),
                        )}
                      </div>
                    ),
                  ),
                )
              }
            />
          ),
        ),
      )}
    </main>
  );
}
