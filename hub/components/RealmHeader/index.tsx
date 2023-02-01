import AssemblyClusterIcon from '@carbon/icons-react/lib/AssemblyCluster';
import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import EarthIcon from '@carbon/icons-react/lib/Earth';
import EditIcon from '@carbon/icons-react/lib/Edit';
import ListDropdownIcon from '@carbon/icons-react/lib/ListDropdown';
import LogoDiscord from '@carbon/icons-react/lib/LogoDiscord';
import LogoGithub from '@carbon/icons-react/lib/LogoGithub';
import LogoInstagram from '@carbon/icons-react/lib/LogoInstagram';
import LogoLinkedin from '@carbon/icons-react/lib/LogoLinkedin';
import OverflowMenuHorizontalIcon from '@carbon/icons-react/lib/OverflowMenuHorizontal';
import UserFollow from '@carbon/icons-react/lib/UserFollow';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/lib/function';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';

import * as Button from '@hub/components/controls/Button';
import { Twitter } from '@hub/components/icons/Twitter';
import * as RealmBanner from '@hub/components/RealmBanner';
import * as RealmHeaderIcon from '@hub/components/RealmHeaderIcon';
import { useMutation } from '@hub/hooks/useMutation';
import { useQuery } from '@hub/hooks/useQuery';
import { ECOSYSTEM_PAGE } from '@hub/lib/constants';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import { ExternalLinkIcon } from './ExternalLinkIcon';
import { ExternalLinkMenuItem } from './ExternalLinkMenuItem';
import * as gql from './gql';
import { Tab } from './Tab';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  bannerUrl?: string | null;
  iconUrl?: string | null;
  name: string;
  realm: PublicKey;
  realmUrlId: string;
  selectedTab?: 'feed' | 'hub' | 'treasury';
  token?: null | {
    mint: PublicKey;
    symbol: string;
  };
  userIsAdmin?: boolean;
  // external links
  discordUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
  linkedInUrl?: string | null;
  twitterHandle?: string | null;
  websiteUrl?: string | null;
}

export function Content(props: Props) {
  const showFullLinkList = useMediaQuery({ query: '(min-width: 768px)' });
  const hasExternalLinks = !!(
    props.websiteUrl ||
    props.twitterHandle ||
    props.instagramUrl ||
    props.discordUrl ||
    props.linkedInUrl ||
    props.githubUrl
  );

  const [followedResp] = useQuery(gql.followedRealmsResp, {
    query: gql.followedRealms,
  });
  const [, follow] = useMutation(gql.followResp, gql.follow);
  const [, unfollow] = useMutation(gql.unfollowResp, gql.unfollow);

  return (
    <header className={cx(props.className, 'bg-white')}>
      <RealmBanner.Content bannerUrl={props.bannerUrl} realm={props.realm} />
      <div className="max-w-7xl mx-auto px-4 relative w-full md:px-8">
        <RealmHeaderIcon.Content
          className={cx('-translate-y-1/2', 'absolute', 'top-0')}
          iconUrl={props.iconUrl}
          realmName={props.name}
        />
        <div
          className={cx(
            'flex',
            'items-center',
            'justify-between',
            'pb-8',
            'pl-4',
            'pr-4',
            'pt-4',
            'md:pl-48',
          )}
        >
          <div className="flex items-baseline relative overflow-visible -mx-4 md:-mx-2">
            <div
              className={cx(
                'absolute',
                'font-semibold',
                'text-3xl',
                'text-neutral-900',
                'top-[52px]',
                'whitespace-nowrap',
                'md:relative',
                'md:top-0',
                'md:whitespace-normal',
              )}
            >
              {props.name}
            </div>
            {props.userIsAdmin && (
              <Link passHref href={`/realm/${props.realmUrlId}/hub/edit`}>
                <a
                  className={cx(
                    'flex',
                    'items-center',
                    'ml-4',
                    'text-neutral-500',
                    'text-xs',
                    'transition-colors',
                    'hover:text-neutral-900',
                  )}
                >
                  <EditIcon className="h-3 w-3 fill-current mr-1" />
                  <div>edit info</div>
                </a>
              </Link>
            )}
          </div>
          <div className="flex items-center">
            {pipe(
              followedResp,
              RE.match(
                () => <div />,
                () => <div />,
                ({ me }) => {
                  if (me) {
                    const isCurrentlyFollowing = me.followedRealms
                      .map((r) => r.publicKey.toBase58())
                      .includes(props.realm.toBase58());

                    if (isCurrentlyFollowing) {
                      return (
                        <Button.Tertiary
                          className="w-36"
                          onClick={() => {
                            unfollow({ realm: props.realm });
                          }}
                        >
                          <CheckmarkIcon className="h-4 w-4 mr-1.5" />
                          Followed
                        </Button.Tertiary>
                      );
                    }

                    return (
                      <Button.Secondary
                        className="w-36"
                        onClick={() => {
                          follow({ realm: props.realm });
                        }}
                      >
                        <UserFollow className="h-4 w-4 mr-1.5" />
                        Follow
                      </Button.Secondary>
                    );
                  }

                  return (
                    <Button.Secondary disabled className="w-36">
                      <UserFollow className="h-4 w-4 mr-1.5" />
                      Follow
                    </Button.Secondary>
                  );
                },
              ),
            )}
          </div>
        </div>
        <div
          className={cx(
            'flex',
            'items-center',
            'space-x-0',
            'justify-between',
            'mt-16',
            '-ml-2',
            'sm:ml-0',
            'sm:space-x-2',
            'sm:justify-start',
            'sm:px-2',
            'md:mt-6',
            'md:space-x-0',
            'md:justify-between',
            'md:px-2',
          )}
        >
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex items-center sm:space-x-2 md:space-x-3">
              <Tab
                href={`/realm/${props.realmUrlId}`}
                icon={<ListDropdownIcon />}
                selected={props.selectedTab === 'feed'}
              >
                feed
              </Tab>
              {!props.realm.equals(ECOSYSTEM_PAGE) && (
                <Tab
                  href={`/realm/${props.realmUrlId}/hub`}
                  icon={<AssemblyClusterIcon />}
                  selected={props.selectedTab === 'hub'}
                >
                  hub
                </Tab>
              )}
              {!props.realm.equals(ECOSYSTEM_PAGE) && (
                <Tab
                  external
                  href={`/dao/${props.realmUrlId}/treasury/v2`}
                  icon={<WalletIcon />}
                  selected={props.selectedTab === 'treasury'}
                >
                  treasury
                </Tab>
              )}
            </NavigationMenu.List>
          </NavigationMenu.Root>
          <NavigationMenu.Root className="flex items-center">
            {showFullLinkList ? (
              <NavigationMenu.List className="flex items-center space-x-6">
                {props.websiteUrl && (
                  <ExternalLinkIcon href={props.websiteUrl}>
                    <EarthIcon />
                  </ExternalLinkIcon>
                )}
                {props.twitterHandle && (
                  <ExternalLinkIcon
                    href={`https://www.twitter.com/${props.twitterHandle}`}
                  >
                    <Twitter />
                  </ExternalLinkIcon>
                )}
                {props.instagramUrl && (
                  <ExternalLinkIcon href={props.instagramUrl}>
                    <LogoInstagram />
                  </ExternalLinkIcon>
                )}
                {props.discordUrl && (
                  <ExternalLinkIcon href={props.discordUrl}>
                    <LogoDiscord />
                  </ExternalLinkIcon>
                )}
                {props.linkedInUrl && (
                  <ExternalLinkIcon href={props.linkedInUrl}>
                    <LogoLinkedin />
                  </ExternalLinkIcon>
                )}
                {props.githubUrl && (
                  <ExternalLinkIcon href={props.githubUrl}>
                    <LogoGithub />
                  </ExternalLinkIcon>
                )}
              </NavigationMenu.List>
            ) : hasExternalLinks ? (
              <NavigationMenu.List>
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className="flex items-center justify-center">
                    <OverflowMenuHorizontalIcon className="fill-neutral-500 h-5 w-5" />
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content
                    className={cx(
                      'absolute',
                      'bg-white',
                      'drop-shadow-lg',
                      'overflow-hidden',
                      'right-0',
                      'rounded',
                      'z-10',
                    )}
                  >
                    <NavigationMenu.Sub>
                      <NavigationMenu.List>
                        {props.websiteUrl && (
                          <ExternalLinkMenuItem
                            href={props.websiteUrl}
                            icon={<EarthIcon />}
                            label="Website"
                          />
                        )}
                        {props.twitterHandle && (
                          <ExternalLinkMenuItem
                            href={`https://www.twitter.com/${props.twitterHandle}`}
                            icon={<Twitter />}
                            label="Twitter"
                          />
                        )}
                        {props.instagramUrl && (
                          <ExternalLinkMenuItem
                            href={props.instagramUrl}
                            icon={<LogoInstagram />}
                            label="Instagram"
                          />
                        )}
                        {props.discordUrl && (
                          <ExternalLinkMenuItem
                            href={props.discordUrl}
                            icon={<LogoDiscord />}
                            label="Discord"
                          />
                        )}
                        {props.linkedInUrl && (
                          <ExternalLinkMenuItem
                            href={props.linkedInUrl}
                            icon={<LogoLinkedin />}
                            label="LinkedIn"
                          />
                        )}
                        {props.githubUrl && (
                          <ExternalLinkMenuItem
                            href={props.githubUrl}
                            icon={<LogoGithub />}
                            label="Github"
                          />
                        )}
                      </NavigationMenu.List>
                    </NavigationMenu.Sub>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            ) : null}
          </NavigationMenu.Root>
        </div>
      </div>
    </header>
  );
}

export function Error(props: BaseProps) {
  return (
    <header className={props.className}>
      <RealmBanner.Error />
      <div className="max-w-7xl mx-auto px-8 relative w-full">
        <RealmHeaderIcon.Error
          className={cx('-translate-y-1/2', 'absolute', 'top-0')}
        />
        <div
          className={cx(
            'flex',
            'items-center',
            'justify-between',
            'pb-8',
            'pl-4',
            'pr-4',
            'pt-4',
            'md:pl-48',
          )}
        >
          <div className="relative overflow-visible -mx-4 md:-mx-2">
            <div
              className={cx(
                'absolute',
                'bg-neutral-200',
                'font-semibold',
                'rounded',
                'text-3xl',
                'text-neutral-900',
                'top-[52px]',
                'whitespace-nowrap',
                'w-48',
                'md:relative',
                'md:top-0',
                'md:whitespace-normal',
              )}
            >
              &nbsp;
            </div>
          </div>
        </div>
        <div
          className={cx(
            'flex',
            'items-center',
            'space-x-0',
            'justify-between',
            'mt-16',
            'sm:space-x-2',
            'sm:justify-start',
            'sm:px-2',
            'md:mt-6',
            'md:space-x-0',
            'md:justify-between',
            'md:px-2',
          )}
        >
          <div className="flex items-center space-x-1 md:space-x-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                className="rounded bg-neutral-200 w-24 md:w-32 h-10"
                key={i}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Loading(props: BaseProps) {
  return (
    <header className={props.className}>
      <RealmBanner.Loading />
      <div className="max-w-7xl mx-auto px-8 relative w-full">
        <RealmHeaderIcon.Loading
          className={cx('-translate-y-1/2', 'absolute', 'top-0')}
        />
        <div
          className={cx(
            'flex',
            'items-center',
            'justify-between',
            'pb-8',
            'pl-4',
            'pr-4',
            'pt-4',
            'md:pl-48',
          )}
        >
          <div className="relative overflow-visible -mx-4 md:-mx-2">
            <div
              className={cx(
                'absolute',
                'bg-neutral-200',
                'font-semibold',
                'rounded',
                'text-3xl',
                'text-neutral-900',
                'top-[52px]',
                'whitespace-nowrap',
                'w-48',
                'md:relative',
                'md:top-0',
                'md:whitespace-normal',
              )}
            >
              &nbsp;
            </div>
          </div>
        </div>
        <div
          className={cx(
            'flex',
            'items-center',
            'space-x-0',
            'justify-between',
            'mt-16',
            'sm:space-x-2',
            'sm:justify-start',
            'sm:px-2',
            'md:mt-6',
            'md:space-x-0',
            'md:justify-between',
            'md:px-2',
          )}
        >
          <div className="flex items-center space-x-1 md:space-x-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                className="rounded bg-neutral-200 w-24 md:w-32 h-10 animate-pulse"
                key={i}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
