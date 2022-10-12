import AssemblyClusterIcon from '@carbon/icons-react/lib/AssemblyCluster';
import EarthIcon from '@carbon/icons-react/lib/Earth';
import ListDropdownIcon from '@carbon/icons-react/lib/ListDropdown';
import LogoDiscord from '@carbon/icons-react/lib/LogoDiscord';
import LogoGithub from '@carbon/icons-react/lib/LogoGithub';
import LogoInstagram from '@carbon/icons-react/lib/LogoInstagram';
import LogoLinkedin from '@carbon/icons-react/lib/LogoLinkedin';
// import ProgressBarRound from '@carbon/icons-react/lib/ProgressBarRound';
// import UserFollow from '@carbon/icons-react/lib/UserFollow';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { PublicKey } from '@solana/web3.js';

import * as Button from '@hub/components/controls/Button';
// import { HeaderTokenPrice } from '@hub/components/HeaderTokenPrice';
import { Twitter } from '@hub/components/icons/Twitter';
import * as RealmBanner from '@hub/components/RealmBanner';
import * as RealmHeaderIcon from '@hub/components/RealmHeaderIcon';
import cx from '@hub/lib/cx';

import { ExternalLinkIcon } from './ExternalLinkIcon';
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
  // external links
  discordUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
  linkedInUrl?: string | null;
  twitterHandle?: string | null;
  websiteUrl?: string | null;
}

export function Content(props: Props) {
  return (
    <header className={cx(props.className, 'bg-white')}>
      <RealmBanner.Content bannerUrl={props.bannerUrl} realm={props.realm} />
      <div className="max-w-7xl mx-auto px-8 relative w-full">
        <RealmHeaderIcon.Content
          className={cx('-translate-y-1/2', 'absolute', 'top-0')}
          iconUrl={props.iconUrl}
          realmName={props.name}
        />
        <div className="pl-48 pt-4 pb-8 pr-4 flex items-center justify-between">
          <div className="-mx-2">
            <div className="font-semibold text-neutral-900 text-3xl">
              {props.name}
            </div>
          </div>
          <div className="flex items-center">
            {/* {props.token && (
              <div className="mr-8">
                <HeaderTokenPrice
                  mint={props.token.mint}
                  symbol={props.token.symbol}
                />
              </div>
            )} */}
            {/* <Button.Secondary className="w-36">
              <UserFollow className="h-4 w-4 mr-1.5" />
              Follow
            </Button.Secondary> */}
            {/* {props.token && (
              <Button.Primary
                className="w-36 text-white ml-2"
                onClick={() => {
                  const { mint, symbol } = props.token;
                }}
              >
                <ProgressBarRound className="h-4 w-4 mr-1.5" />
                Buy #{props.token.symbol}
              </Button.Primary>
            )} */}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between px-2">
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex items-center space-x-3">
              <Tab
                href={`/realm/${props.realmUrlId}`}
                icon={<ListDropdownIcon />}
                selected={props.selectedTab === 'feed'}
              >
                feed
              </Tab>
              <Tab
                href={`/realm/${props.realmUrlId}/hub`}
                icon={<AssemblyClusterIcon />}
                selected={props.selectedTab === 'hub'}
              >
                hub
              </Tab>
              <Tab
                external
                href={`/dao/${props.realmUrlId}/treasury/v2`}
                icon={<WalletIcon />}
                selected={props.selectedTab === 'treasury'}
              >
                treasury
              </Tab>
            </NavigationMenu.List>
          </NavigationMenu.Root>
          <NavigationMenu.Root className="flex items-center">
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
        <div className="pl-48 pt-4 pb-8 pr-4 flex items-center">
          <div className="-mx-2">
            <div
              className={cx(
                'font-semibold',
                'text-neutral-900',
                'text-3xl',
                'w-48',
                'bg-neutral-200',
                'rounded',
              )}
            >
              &nbsp;
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="rounded bg-neutral-200 w-32 h-10" key={i} />
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
        <div className="pl-48 pt-4 pb-8 pr-4 flex items-center">
          <div className="-mx-2">
            <div
              className={cx(
                'font-semibold',
                'text-neutral-900',
                'text-3xl',
                'w-48',
                'bg-neutral-200',
                'rounded',
                'animate-pulse',
              )}
            >
              &nbsp;
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                className="rounded bg-neutral-200 w-32 h-10 animate-pulse"
                key={i}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
