import * as Separator from '@radix-ui/react-separator';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';
import Head from 'next/head';

import { EcosystemHeader } from '@hub/components/EcosystemHeader';
import * as Back from '@hub/components/FeedItem/Back';
import * as CommentTree from '@hub/components/FeedItem/CommentTree';
import * as Footer from '@hub/components/FeedItem/Footer';
import * as feedItemGql from '@hub/components/FeedItem/gql';
import * as Header from '@hub/components/FeedItem/Header';
import * as Title from '@hub/components/FeedItem/Title';
import * as RealmHeader from '@hub/components/RealmHeader';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useQuery } from '@hub/hooks/useQuery';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
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
            <div>
              <RealmHeader.Error />
              <div className="max-w-3xl mx-auto pt-8 w-full">
                <Back.Error className="mb-8 mt-4" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Header.Error className="mt-6" />
                <Title.Error className="mt-5 mb-11" />
                <div className="mb-16 rounded w-full h-20 bg-neutral-200" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Footer.Error className="mt-5" />
              </div>
            </div>
          ),
          () => (
            <div>
              <RealmHeader.Loading />
              <div className="max-w-3xl mx-auto pt-8 w-full">
                <Back.Loading className="mb-8 mt-4" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Header.Loading className="mt-6" />
                <Title.Loading className="mt-5 mb-11" />
                <div className="mb-16 rounded w-full h-20 bg-neutral-200 animate-pulse" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Footer.Loading className="mt-5" />
              </div>
            </div>
          ),
          ({ realm, hub }) =>
            pipe(
              feedItemResult,
              RE.match(
                () => (
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
                    <div className="max-w-3xl mx-auto pt-8 w-full">
                      <Back.Error className="mb-8 mt-4" />
                      <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                      <Header.Error className="mt-6" />
                      <Title.Error className="mt-5 mb-11" />
                      <div className="mb-16 rounded w-full h-20 bg-neutral-200" />
                      <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                      <Footer.Error className="mt-5" />
                    </div>
                  </div>
                ),
                () => (
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
                    <div className="max-w-3xl mx-auto pt-8 w-full">
                      <Back.Loading className="mb-8 mt-4" />
                      <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                      <Header.Loading className="mt-6" />
                      <Title.Loading className="mt-5 mb-11" />
                      <div className="mb-16 rounded w-full h-20 bg-neutral-200 animate-pulse" />
                      <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                      <Footer.Loading className="mt-5" />
                    </div>
                  </div>
                ),
                ({ feedItem }) => (
                  <div>
                    <Head>
                      <title>
                        {feedItem.title} - {realm.name}
                      </title>
                      <meta
                        property="og:title"
                        content={`${feedItem.title} - ${realm.name}`}
                        key="title"
                      />
                    </Head>
                    {props.realm.equals(ECOSYSTEM_PAGE) ? (
                      <EcosystemHeader />
                    ) : (
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
                    )}
                    <div className="max-w-3xl mx-auto pt-8 w-full">
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
                  </div>
                ),
              ),
            ),
        ),
      )}
    </main>
  );
}
