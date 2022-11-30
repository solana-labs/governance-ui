import * as Separator from '@radix-ui/react-separator';
import { pipe } from 'fp-ts/function';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { EcosystemHeader } from '@hub/components/EcosystemHeader';
import * as RealmHeader from '@hub/components/RealmHeader';
import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useJWT } from '@hub/hooks/useJWT';
import { useQuery } from '@hub/hooks/useQuery';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import * as RE from '@hub/types/Result';

import { AdditionalCommentTree } from './AdditionalCommentTree';
import * as Back from './Back';
import * as CommentTree from './CommentTree';
import * as Footer from './Footer';
import * as gql from './gql';
import * as Header from './Header';
import * as ReplyBox from './ReplyBox';
import * as Title from './Title';

interface Props {
  className?: string;
  feedItemId: string;
  realmUrlId: string;
}

export function FeedItem(props: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [realmResult] = useQuery(gql.getRealmResp, {
    query: gql.getRealm,
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

  const [feedItemResult] = useQuery(gql.getFeedItemResp, {
    query: gql.getFeedItem,
    variables: {
      realm: realmPublicKey?.toBase58(),
      feedItemId: props.feedItemId,
    },
    pause: !realmPublicKey,
  });

  const [commentsResult, refreshComments] = useQuery(gql.getCommentsResp, {
    query: gql.getComments,
    variables: { feedItemId: props.feedItemId },
  });

  const [jwt] = useJWT();

  const [additionalPageCursors, setAdditionalPageCursors] = useState<string[]>(
    [],
  );

  const router = useRouter();

  const firstPageEndCursor = RE.isOk(commentsResult)
    ? commentsResult.data.feedItemCommentTree.pageInfo.endCursor
    : null;

  useEffect(() => {
    setAdditionalPageCursors([]);
  }, [refreshKey]);

  useEffect(() => {
    if (firstPageEndCursor) {
      setAdditionalPageCursors([firstPageEndCursor]);
    }
  }, [firstPageEndCursor]);

  return (
    <main className={props.className}>
      {pipe(
        realmResult,
        RE.match(
          () => (
            <div>
              <RealmHeader.Error />
              <div className="max-w-3xl mx-auto pt-8 w-full px-4">
                <Back.Error className="mb-8 mt-4" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Header.Error className="mt-6" />
                <Title.Error className="mt-5 mb-11" />
                <div className="mb-16 rounded w-full h-20 bg-neutral-200" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Footer.Error className="mt-5" />
                {jwt && <ReplyBox.Error className="mt-8 mb-4" />}
                <div className="pt-8">
                  <CommentTree.Error />
                </div>
              </div>
            </div>
          ),
          () => (
            <div>
              <RealmHeader.Loading />
              <div className="max-w-3xl mx-auto pt-8 w-full px-4">
                <Back.Loading className="mb-8 mt-4" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Header.Loading className="mt-6" />
                <Title.Loading className="mt-5 mb-11" />
                <div className="mb-16 rounded w-full h-20 bg-neutral-200 animate-pulse" />
                <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                <Footer.Loading className="mt-5" />
                {jwt && <ReplyBox.Loading className="mt-8 mb-4" />}
                <div className="pt-8">
                  <CommentTree.Loading />
                </div>
              </div>
            </div>
          ),
          ({ realmByUrlId }) => {
            return (
              <div>
                {props.realmUrlId === 'ecosystem' ? (
                  <EcosystemHeader />
                ) : (
                  <RealmHeader.Content
                    bannerUrl={realmByUrlId.bannerImageUrl}
                    iconUrl={realmByUrlId.iconUrl}
                    name={realmByUrlId.name}
                    realm={realmByUrlId.publicKey}
                    realmUrlId={props.realmUrlId}
                    selectedTab="feed"
                    token={realmByUrlId.token}
                    userIsAdmin={realmByUrlId.amAdmin}
                    twitterHandle={realmByUrlId.twitterHandle}
                    websiteUrl={realmByUrlId.websiteUrl}
                    discordUrl={realmByUrlId.discordUrl}
                    githubUrl={realmByUrlId.githubUrl}
                    instagramUrl={realmByUrlId.instagramUrl}
                    linkedInUrl={realmByUrlId.linkedInUrl}
                  />
                )}
                {pipe(
                  feedItemResult,
                  RE.match(
                    () => (
                      <div className="max-w-3xl mx-auto pt-8 w-full px-4">
                        <Back.Error className="mb-8 mt-4" />
                        <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                        <Header.Error className="mt-6" />
                        <Title.Error className="mt-5 mb-11" />
                        <div className="mb-16 rounded w-full h-20 bg-neutral-200" />
                        <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                        <Footer.Error className="mt-5" />
                        {jwt && <ReplyBox.Error className="mt-8 mb-4" />}
                        <div className="pt-8">
                          <CommentTree.Error />
                        </div>
                      </div>
                    ),
                    () => (
                      <div className="max-w-3xl mx-auto pt-8 w-full px-4">
                        <Back.Loading className="mb-8 mt-4" />
                        <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                        <Header.Loading className="mt-6" />
                        <Title.Loading className="mt-5 mb-11" />
                        <div className="mb-16 rounded w-full h-20 bg-neutral-200 animate-pulse" />
                        <Separator.Root className="h-[1px] bg-neutral-300 w-full" />
                        <Footer.Loading className="mt-5" />
                        {jwt && <ReplyBox.Loading className="mt-8 mb-4" />}
                        <div className="pt-8">
                          <CommentTree.Loading />
                        </div>
                      </div>
                    ),
                    ({ feedItem }) => (
                      <div
                        className="max-w-3xl mx-auto pt-8 w-full px-4"
                        key={String(refreshKey)}
                      >
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
                        <Back.Content
                          className="mb-7 mt-4"
                          url={`/realm/${props.realmUrlId}`}
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
                        {jwt && (
                          <ReplyBox.Content
                            className="mt-8 mb-4"
                            feedItemId={props.feedItemId}
                            realm={realmByUrlId.publicKey}
                          />
                        )}
                        {pipe(
                          commentsResult,
                          RE.match(
                            () => (
                              <div className="pt-8">
                                <CommentTree.Error />
                              </div>
                            ),
                            () => (
                              <div className="pt-8">
                                <CommentTree.Loading />
                              </div>
                            ),
                            ({ feedItemCommentTree }) => (
                              <div className="pt-8 pb-16">
                                <CommentTree.Content
                                  showClientSideComments
                                  comments={feedItemCommentTree.edges.map(
                                    (edge) => edge.node,
                                  )}
                                  feedItemId={props.feedItemId}
                                  realm={realmByUrlId.publicKey}
                                  realmUrlId={props.realmUrlId}
                                  userIsAdmin={realmByUrlId.amAdmin}
                                  onRefresh={() => {
                                    refreshComments({
                                      requestPolicy: 'network-only',
                                    });
                                    setRefreshKey((key) => key + 1);
                                  }}
                                />
                                {additionalPageCursors.map((cursor) => (
                                  <AdditionalCommentTree
                                    className="mt-9"
                                    cursor={cursor}
                                    feedItemId={props.feedItemId}
                                    key={cursor}
                                    realm={realmByUrlId.publicKey}
                                    realmUrlId={props.realmUrlId}
                                    userIsAdmin={realmByUrlId.amAdmin}
                                    onLoadMore={(newCursor) =>
                                      setAdditionalPageCursors((cursors) =>
                                        cursors.concat(newCursor),
                                      )
                                    }
                                    onRefresh={() => {
                                      refreshComments({
                                        requestPolicy: 'network-only',
                                      });
                                      setRefreshKey((key) => key + 1);
                                    }}
                                  />
                                ))}
                              </div>
                            ),
                          ),
                        )}
                      </div>
                    ),
                  ),
                )}
              </div>
            );
          },
        ),
      )}
    </main>
  );
}
