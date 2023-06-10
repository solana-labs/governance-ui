import WarningIcon from '@carbon/icons-react/lib/Warning';
import * as Dialog from '@radix-ui/react-dialog';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import { produce } from 'immer';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import * as Button from '@components/core/controls/Button';
import { Input } from '@hub/components/controls/Input';
import { useMutation } from '@hub/hooks/useMutation';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';
import { RealmSelect } from './RealmSelect';
import { SpotlightEditor } from './SpotlightEditor';
import { TrendingSelect } from './TrendingSelect';

function buildFormStateFromData(data: gql.DiscoverPage) {
  const keyAnnouncements = ['', '', '', '', ''];

  data.keyAnnouncements.forEach((item, i) => {
    keyAnnouncements[i] = item.id;
  });

  return { ...data, keyAnnouncements };
}

function removeExtraneousFields<T extends { __typename?: string }>(
  item: T,
): Omit<T, '__typename'> {
  // eslint-disable-next-line
  const { __typename, ...rest } = item;
  return rest;
}

interface FormState {
  daoTooling: gql.Realm[];
  defi: gql.Realm[];
  gaming: gql.Realm[];
  hackathonWinners: gql.Realm[];
  keyAnnouncements: string[];
  nftCollections: gql.Realm[];
  popular: gql.Realm[];
  spotlight: {
    description: string;
    heroImageUrl: string;
    publicKey: PublicKey;
    stats: {
      value: string;
      label: string;
    }[];
    realm: {
      urlId: string;
    };
    title: string;
  }[];
  trending: gql.Realm[];
  web3: gql.Realm[];
}

function getSectionTitle(key: keyof FormState) {
  switch (key) {
    case 'daoTooling':
      return 'DAO Tooling';
    case 'defi':
      return 'DeFi';
    case 'gaming':
      return 'Gaming';
    case 'hackathonWinners':
      return 'Hackathon Winners';
    case 'keyAnnouncements':
      return 'Key Announcements';
    case 'nftCollections':
      return 'NFT Collections';
    case 'popular':
      return 'Popular';
    case 'spotlight':
      return 'Project Spotlight';
    case 'trending':
      return 'Trending Orgs';
    case 'web3':
      return 'Web3';
  }
}

interface Props {
  className?: string;
}

export function EditDiscoverPage(props: Props) {
  const [result] = useQuery(gql.getDiscoverPageResp, {
    query: gql.getDiscoverPage,
  });
  const [formState, setFormState] = useState<null | FormState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, updateDiscoverPage] = useMutation(
    gql.updateDiscoverPageResp,
    gql.updateDiscoverPage,
  );

  useEffect(() => {
    if (RE.isOk(result) && formState === null) {
      setFormState(buildFormStateFromData(result.data.discoverPage));
    }
  }, [result]);

  return (
    <article className={props.className}>
      {pipe(
        result,
        RE.match(
          () => <div />,
          () => <div />,
          ({ me }) => (
            <div>
              <Head>
                <title>Edit Discover Page</title>
                <meta
                  property="og:title"
                  content="Edit Discover Page"
                  key="title"
                />
              </Head>
              {me?.amSiteAdmin === true ? (
                <div className="flex flex-col items-center">
                  <section className="w-full max-w-[1104px] mb-12">
                    <h1 className="mb-4">{getSectionTitle('spotlight')}</h1>
                    <div className="space-y-16">
                      {(formState?.spotlight || []).map((item, i) => (
                        <SpotlightEditor
                          key={i}
                          value={item}
                          onChange={(newItem) => {
                            const list = formState?.spotlight || [];
                            const newList = produce(list, (data) => {
                              data[i] = newItem;
                            });
                            if (formState) {
                              const newState = produce(formState, (data) => {
                                data.spotlight = newList;
                              });
                              setFormState(newState);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </section>
                  <div className="w-full max-w-[1104px] mb-12">
                    {(['trending'] as const).map((key) => {
                      const realms = formState?.[key] || [];

                      return (
                        <section key={key}>
                          <h1 className="mb-4">{getSectionTitle(key)}</h1>
                          <div className="space-y-2">
                            {realms.map((realm, i) => (
                              <TrendingSelect
                                key={i}
                                value={realm}
                                onChange={(newRealm) => {
                                  if (newRealm && formState) {
                                    const newList = produce(realms, (data) => {
                                      data[i] = newRealm;
                                    });
                                    const newState = produce(
                                      formState,
                                      (data) => {
                                        data[key] = newList;
                                      },
                                    );
                                    setFormState(newState);
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                  <section className="w-full max-w-[1104px] mb-12">
                    <h1 className="mb-4">
                      {getSectionTitle('keyAnnouncements')}
                    </h1>
                    <div className="grid grid-cols-5 gap-x-2 w-full">
                      {(formState?.keyAnnouncements || []).map(
                        (announcementId, i) => (
                          <div key={i}>
                            <Input
                              className="w-full"
                              value={announcementId}
                              onChange={(e) => {
                                if (formState) {
                                  const value = e.currentTarget.value;
                                  const curList =
                                    formState?.keyAnnouncements || [];
                                  const newList = produce(curList, (data) => {
                                    data[i] = value;
                                  });
                                  const newState = produce(
                                    formState,
                                    (data) => {
                                      data.keyAnnouncements = newList;
                                    },
                                  );
                                  setFormState(newState);
                                }
                              }}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                  <div className="space-y-12 mb-12">
                    {([
                      'hackathonWinners',
                      'daoTooling',
                      'defi',
                      'gaming',
                      'nftCollections',
                      'popular',
                      'web3',
                    ] as const).map((key) => {
                      const realms = formState?.[key] || [];
                      return (
                        <section key={key}>
                          <h1 className="mb-4">{getSectionTitle(key)}</h1>
                          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                            {realms.map((realm, i) => (
                              <RealmSelect
                                className="h-[290px] max-w-[270px]"
                                key={i}
                                value={realm}
                                onChange={(newRealm) => {
                                  if (newRealm && formState) {
                                    const newList = produce(realms, (data) => {
                                      data[i] = newRealm;
                                    });
                                    const newState = produce(
                                      formState,
                                      (data) => {
                                        data[key] = newList;
                                      },
                                    );
                                    setFormState(newState);
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                  <footer className="flex items-center justify-end w-full max-w-[1104px]">
                    <Button.Primary
                      pending={submitting}
                      onClick={async () => {
                        const submission = {
                          daoTooling: (formState?.daoTooling || []).map(
                            (r) => r.publicKey,
                          ),
                          defi: (formState?.defi || []).map((r) => r.publicKey),
                          gaming: (formState?.gaming || []).map(
                            (r) => r.publicKey,
                          ),
                          hackathonWinners: (
                            formState?.hackathonWinners || []
                          ).map((r) => r.publicKey),
                          keyAnnouncements: (
                            formState?.keyAnnouncements || []
                          ).filter(Boolean),
                          nftCollections: (formState?.nftCollections || []).map(
                            (r) => r.publicKey,
                          ),
                          popular: (formState?.popular || []).map(
                            (r) => r.publicKey,
                          ),
                          spotlight: (formState?.spotlight || []).map((s) => {
                            // eslint-disable-next-line
                            const { realm, ...rest } = s;
                            return removeExtraneousFields({
                              ...rest,
                              stats: (rest.stats as any).map(
                                removeExtraneousFields,
                              ),
                            } as any);
                          }),
                          trending: (formState?.trending || []).map(
                            (r) => r.publicKey,
                          ),
                          web3: (formState?.web3 || []).map((r) => r.publicKey),
                        };

                        setSubmitting(true);
                        const resp = await updateDiscoverPage({
                          data: submission,
                        });
                        setSubmitting(false);

                        if (RE.isOk(resp)) {
                          setFormState(
                            buildFormStateFromData(
                              resp.data.updateDiscoverPage,
                            ),
                          );
                        }
                      }}
                    >
                      Save
                    </Button.Primary>
                  </footer>
                </div>
              ) : (
                <Dialog.Root open>
                  <Dialog.Overlay
                    className={cx(
                      'backdrop-blur-lg',
                      'bg-white/30',
                      'bottom-0',
                      'fixed',
                      'flex',
                      'items-center',
                      'justify-center',
                      'left-0',
                      'p-8',
                      'right-0',
                      'top-0',
                      'z-20',
                    )}
                  >
                    <div className="flex flex-col space-y-3 items-center">
                      <div className="flex items-center space-x-2">
                        <WarningIcon className="h-7 w-7 fill-rose-500" />
                        <div className="font-bold text-2xl text-neutral-900">
                          Forbidden
                        </div>
                      </div>
                      <div className="text-neutral-700 text-center">
                        You are not authorized to view this page
                      </div>
                    </div>
                  </Dialog.Overlay>
                </Dialog.Root>
              )}
            </div>
          ),
        ),
      )}
    </article>
  );
}
