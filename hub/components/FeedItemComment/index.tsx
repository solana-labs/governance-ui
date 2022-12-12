import * as Separator from '@radix-ui/react-separator';
import { pipe } from 'fp-ts/function';
import Head from 'next/head';
import { useRouter } from 'next/router';

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
  realmUrlId: string;
}

export function FeedItemComment(props: Props) {
  const [realmResult] = useQuery(feedItemGql.getRealmResp, {
    query: feedItemGql.getRealm,
    variables: {
      urlId:
        props.realmUrlId === 'ecosystem'
          ? ECOSYSTEM_PAGE.toBase58()
          : props.realmUrlId,
    },
  });

  const realmPublicKey = RE.isOk(realmResult)
    ? realmResult.data.realmByUrlId.publicKey
    : null;

  const [feedItemResult] = useQuery(feedItemGql.getFeedItemResp, {
    query: feedItemGql.getFeedItem,
    variables: {
      realm: realmPublicKey?.toBase58(),
      feedItemId: props.feedItemId,
    },
    pause: !realmPublicKey,
  });

  const [commentResult, refresh] = useQuery(gql.getCommentResp, {
    query: gql.getComments,
    variables: { commentId: props.commentId, feedItemId: props.feedItemId },
    pause: !realmPublicKey,
  });

  const router = useRouter();

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
          ({ realmByUrlId }) =>
            pipe(
              feedItemResult,
              RE.match(
                () => (
                  <div>
                    <RealmHeader.Content
                      bannerUrl={realmByUrlId.bannerImageUrl}
                      iconUrl={realmByUrlId.iconUrl}
                      name={realmByUrlId.displayName || realmByUrlId.name}
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
                      bannerUrl={realmByUrlId.bannerImageUrl}
                      iconUrl={realmByUrlId.iconUrl}
                      name={realmByUrlId.displayName || realmByUrlId.name}
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
                        {feedItem.title} - {realmByUrlId.name}
                      </title>
                      <meta
                        property="og:title"
                        content={`${feedItem.title} - ${realmByUrlId.name}`}
                        key="title"
                      />
                    </Head>
                    {props.realmUrlId === 'ecosystem' ? (
                      <EcosystemHeader />
                    ) : (
                      <RealmHeader.Content
                        bannerUrl={realmByUrlId.bannerImageUrl}
                        iconUrl={realmByUrlId.iconUrl}
                        name={realmByUrlId.displayName || realmByUrlId.name}
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
                    )}
                    <div className="max-w-3xl mx-auto pt-8 w-full">
                      <Back.Content
                        className="mb-7 mt-4"
                        url={`/realm/${props.realmUrlId}/${feedItem.id}`}
                      />
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
                        realm={realmByUrlId.publicKey}
                        score={feedItem.score}
                        type={feedItem.type}
                        userVote={feedItem.myVote}
                        userIsAdmin={realmByUrlId.amAdmin}
                        onDelete={() => {
                          router.push(`/realm/${props.realmUrlId}`);
                        }}
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
                                realm={realmByUrlId.publicKey}
                                realmUrlId={props.realmUrlId}
                                onRefresh={() =>
                                  refresh({ requestPolicy: 'network-only' })
                                }
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
