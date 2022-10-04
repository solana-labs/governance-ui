import ChevronRightIcon from '@carbon/icons-react/lib/ChevronRight';
import FavoriteIcon from '@carbon/icons-react/lib/Favorite';
import FavoriteFilledIcon from '@carbon/icons-react/lib/FavoriteFilled';
import type { PublicKey } from '@solana/web3.js';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';
import { pipe } from 'fp-ts/function';
import Link from 'next/link';

import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import { isEmpty } from '@hub/lib/richText';
import { FeedItemVoteType } from '@hub/types/FeedItemVoteType';
import { ProposalState } from '@hub/types/ProposalState';
import * as RE from '@hub/types/Result';

import * as gql from './gql';

interface Props {
  className?: string;
  realm: PublicKey;
  realmUrlId: string;
}

export function Trending(props: Props) {
  const [result] = useQuery(gql.getTrendingResp, {
    query: gql.getTrending,
    variables: { realm: props.realm.toBase58() },
  });

  console.log(result);

  return (
    <div className={props.className}>
      {pipe(
        result,
        RE.match(
          () => <div />,
          () => <div />,
          ({ feed }) => {
            const edges = feed.edges
              .filter((edge) => {
                if (edge.node.proposal) {
                  const state = edge.node.proposal.state;

                  return (
                    state !== ProposalState.Cancelled &&
                    state !== ProposalState.Draft
                  );
                }

                return true;
              })
              .slice(0, 3);

            return (
              <div className="space-y-5">
                {edges.map((edge, i) => {
                  const isNew =
                    Math.abs(
                      differenceInMinutes(edge.node.updated, Date.now()),
                    ) < 1;

                  return (
                    <Link
                      passHref
                      href={`/realm/${props.realmUrlId}/${edge.node.id}`}
                    >
                      <a className="px-4 grid grid-cols-[24px,1fr] gap-x-6 group">
                        <div className="text-xs leading-5 text-neutral-900 font-medium">
                          {(i + 1).toString().padStart(2, '0')}
                        </div>
                        <div>
                          <div
                            className={cx(
                              'font-bold',
                              'text-neutral-900',
                              'text-sm',
                              'transition-colors',
                              'group-hover:text-sky-500',
                            )}
                          >
                            {edge.node.title}
                          </div>
                          {!isEmpty(edge.node.clippedDocument.document) && (
                            <RichTextDocumentDisplay
                              className="text-sm text-neutral-500 mt-2"
                              document={edge.node.clippedDocument.document}
                              isClipped={edge.node.clippedDocument.isClipped}
                            />
                          )}
                          <div className="flex items-center mt-2">
                            {edge.node.myVote === FeedItemVoteType.Approve ? (
                              <FavoriteFilledIcon className="fill-sky-500" />
                            ) : (
                              <FavoriteIcon className="fill-neutral-500" />
                            )}
                            <div
                              className={cx(
                                'ml-1',
                                'text-xs',
                                edge.node.myVote === FeedItemVoteType.Approve
                                  ? 'text-sky-500'
                                  : 'text-neutral-500',
                              )}
                            >
                              {edge.node.score}
                            </div>
                            <div className="text-xs text-neutral-500 ml-3">
                              {isNew
                                ? 'New!'
                                : `${formatDistanceToNowStrict(
                                    edge.node.updated,
                                  )} ago`}
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  );
                })}
                <Link passHref href={`/realm/${props.realmUrlId}`}>
                  <a
                    className={cx(
                      'flex',
                      'h-8',
                      'items-center',
                      'justify-center',
                      'text-neutral-500',
                      'text-xs',
                      'w-full',
                      'hover:text-sky-500',
                    )}
                  >
                    <div className="transition-colors">All posts</div>
                    <ChevronRightIcon className="fill-current h-3 w-3 ml-1.5 transition-colors" />
                  </a>
                </Link>
              </div>
            );
          },
        ),
      )}
    </div>
  );
}
