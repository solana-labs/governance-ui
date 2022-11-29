import OrderDetailsIcon from '@carbon/icons-react/lib/OrderDetails';
import { PublicKey } from '@solana/web3.js';
import { cloneElement, useState } from 'react';

import { FieldDescription } from '../common/FieldDescription';
import { FieldHeader } from '../common/FieldHeader';
import { FieldIconPreview } from '../common/FieldIconPreview';
import { Input } from '@hub/components/controls/Input';
import * as Radio from '@hub/components/controls/Radio';
import { getCategoryName, getCategoryIcon } from '@hub/components/OrgCategory';
import cx from '@hub/lib/cx';
import { RealmCategory } from '@hub/types/RealmCategory';

interface Props {
  className?: string;
  bannerImageUrl: null | string;
  category: RealmCategory;
  discordUrl: null | string;
  displayName: string;
  documentation: null | {
    title: null | string;
    url: string;
  };
  githubUrl: null | string;
  iconUrl: null | string;
  instagramUrl: null | string;
  name: string;
  publicKey: PublicKey;
  shortDescription: null | string;
  symbol: null | string;
  symbolIsValid?: boolean;
  tokenIsValid?: boolean;
  tokenMintStr: null | string;
  twitterHandle: null | string;
  websiteUrl: null | string;
  onBannerImageUrlChange?(url: null | string): void;
  onCategoryChange?(category: RealmCategory): void;
  onDiscordUrlChange?(url: null | string): void;
  onDisplayNameChange?(name: string): void;
  onDocumentationChange?(
    doc: null | { title: null | string; url: string },
  ): void;
  onGithubUrlChange?(url: null | string): void;
  onIconUrlChange?(url: null | string): void;
  onInstagramUrlChange?(url: null | string): void;
  onShortDescriptionChange?(text: null | string): void;
  onSymbolChange?(symbol: null | string): void;
  onTokenMintStrChange?(mint: null | string): void;
  onTwitterHandleChange?(handle: null | string): void;
  onWebsiteUrlChange?(url: null | string): void;
}

export function BasicInfo(props: Props) {
  const [avatarInvalid, setAvatarInvalid] = useState(false);
  const [bannerInvalid, setBannerInvalid] = useState(false);

  return (
    <section className={props.className}>
      <header className="flex items-center space-x-2 mb-16">
        <OrderDetailsIcon className="h-4 w-4 sm:h-6 sm:w-6 fill-sky-500" />
        <div className="text-xl sm:text-3xl font-medium text-neutral-900">
          Let’s gather some basic details.
        </div>
      </header>
      <div>
        <FieldHeader className="mb-1">Display Name</FieldHeader>
        <FieldDescription>
          Your organization has an official on-chain name. However, for display
          purposes, if you would like to use a different name, you can do so. If
          you do not specify a display name, it will default to your on-chain
          name.
        </FieldDescription>
        <Input
          className="w-full mt-2"
          placeholder="e.g. Realms Community Hub"
          value={props.displayName}
          onChange={(e) => {
            const value = e.currentTarget.value;
            props.onDisplayNameChange?.(value);
          }}
          onBlur={(e) => {
            const value = e.currentTarget.value;

            if (!value) {
              props.onDisplayNameChange?.(props.name);
            }
          }}
        />
      </div>
      <div className="mt-9">
        <FieldHeader className="mb-1">Short Description</FieldHeader>
        <FieldDescription>
          You can provide a short (one sentence) description of your
          organization or product. This text will be used on the Discover page
          to describe your organization.
        </FieldDescription>
        <Input
          className="w-full mt-2"
          placeholder="e.g. The home for all things Realms"
          value={props.shortDescription || ''}
          onChange={(e) => {
            const value = e.currentTarget.value || null;
            props.onShortDescriptionChange?.(value);
          }}
        />
      </div>
      <div className="mt-8">
        <FieldHeader className="mb-1">Symbol</FieldHeader>
        <FieldDescription>
          You can choose to give your organization a symbol. The symbol is
          primarily used to give your organization a human readable url. If you
          leave it blank, your organization will be found at your public key
          instead.{' '}
          <span className="font-bold">
            Note: Your symbol must be unique and cannot match any other
            organization's symbol.
          </span>
        </FieldDescription>
        <Input
          className="w-full mt-2"
          placeholder="e.g. RCH"
          value={props.symbol || ''}
          onChange={(e) => {
            const value = e.currentTarget.value || null;
            props.onSymbolChange?.(value);
          }}
        />
        {props.symbolIsValid === false ? (
          <div className="text-xs mt-1 text-rose-500">
            You cannot use that symbol. It may be already in use.
          </div>
        ) : (
          <div className="flex items-center text-xs mt-1 truncate">
            <div className="hidden sm:block text-neutral-500">
              Your organization's url:&nbsp;
            </div>
            <div className="sm:hidden text-neutral-500">Url:&nbsp;</div>
            <a
              className="block text-sky-500"
              href={`/realm/${encodeURIComponent(
                props.symbol || props.publicKey.toBase58(),
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              {`https://app.realms.today/realm/${encodeURIComponent(
                props.symbol || props.publicKey.toBase58(),
              )}`}
            </a>
          </div>
        )}
      </div>
      <div className="mt-9">
        <FieldHeader className="mb-1">Avatar</FieldHeader>
        <FieldDescription>
          Please input a URL linking to a square JPG or PNG (no Google Drive
          link, instead something publicly accessible like Imgur). Preferably
          under 300KB to prevent long load times.
        </FieldDescription>
        <div className="grid grid-cols-[1fr,56px] gap-x-4 mt-2">
          <Input
            className="w-full"
            placeholder="e.g. imgur.com/avatar.png"
            value={props.iconUrl || ''}
            onChange={(e) => {
              const value = e.currentTarget.value || null;
              props.onIconUrlChange?.(value);
            }}
          />
          <div className="relative">
            <button
              className={cx(
                '-mt-5',
                'absolute',
                'text-center',
                'text-xs',
                'top-0',
                'tracking-normal',
                'w-full',
                props.iconUrl ? 'text-rose-500' : 'text-neutral-300',
              )}
              disabled={!props.iconUrl}
              onClick={() => {
                props.onIconUrlChange?.(null);
              }}
            >
              Remove
            </button>
            <FieldIconPreview
              className="rounded-full"
              url={props.iconUrl}
              onError={() => setAvatarInvalid(true)}
              onClearError={() => setAvatarInvalid(false)}
            />
          </div>
        </div>
        {avatarInvalid && (
          <div className="text-xs text-rose-500 mt-1 grid grid-cols-[1fr,56px] gap-x-4">
            <div>
              The URL should support hot-linking, and should point to an image.
              It appears that the URL you provided doesn't work. Please try
              another URL.
            </div>
            <div />
          </div>
        )}
      </div>
      <div className="mt-9">
        <FieldHeader className="mb-1">Banner Image</FieldHeader>
        <FieldDescription>
          Please input a URL linking to a landscape-oriented JPG or PNG (no
          Google Drive link, instead something publicly accessible like Imgur).
          We recommend omitting text from banners to avoid formatting issues.
          Preferably under 1MB to prevent long load times.
        </FieldDescription>
        <div className="mt-2">
          <Input
            className="w-full"
            placeholder="e.g. imgur.com/banner.png"
            value={props.bannerImageUrl || ''}
            onChange={(e) => {
              const value = e.currentTarget.value || null;
              props.onBannerImageUrlChange?.(value);
              setBannerInvalid(false);
            }}
          />
          {props.bannerImageUrl ? (
            <div
              className={cx(
                'border-zinc-300',
                'border',
                'h-24',
                'mt-4',
                'overflow-hidden',
                'relative',
              )}
            >
              <img
                className={cx(
                  '-translate-x-1/2',
                  '-translate-y-1/2',
                  'absolute',
                  'border-none',
                  'left-1/2',
                  'top-1/2',
                  'w-full',
                  bannerInvalid && 'bg-rose-200 h-full',
                )}
                src={props.bannerImageUrl}
                onError={() => setBannerInvalid(true)}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-zinc-300 h-24 mt-4" />
          )}
        </div>
        <div className="grid grid-cols-[1fr,56px] gap-x-4 items-start mt-1">
          <div>
            {bannerInvalid && (
              <div className="text-xs text-rose-500">
                The URL should support hot-linking, and should point to an
                image. It appears that the URL you provided doesn't work. Please
                try another URL.
              </div>
            )}
          </div>
          <div className="flex items-center justify-end">
            <button
              className={cx(
                'text-xs',
                'tracking-normal',
                props.bannerImageUrl ? 'text-rose-500' : 'text-neutral-300',
              )}
              disabled={!props.bannerImageUrl}
              onClick={() => {
                props.onBannerImageUrlChange?.(null);
                setBannerInvalid(false);
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <FieldHeader className="hidden sm:block mb-1">
          How would you categorize your organization?
        </FieldHeader>
        <FieldHeader className="sm:hidden mb-1">Category</FieldHeader>
        <Radio.Root
          className={cx(
            'gap-y-4',
            'grid-cols-1',
            'grid',
            'max-w-2xl',
            'mt-4',
            'w-full',
            'sm:gap-y-8',
            'sm:grid-cols-2',
            'sm:mt-8',
          )}
          value={props.category}
          onValueChange={props.onCategoryChange}
        >
          {Object.values(RealmCategory).map((category) => {
            const icon = getCategoryIcon(category);
            const name = getCategoryName(category);

            return (
              <Radio.Item
                checked={props.category === category}
                className="text-neutral-900"
                key={category}
                value={category}
              >
                {cloneElement(icon, {
                  className: cx(icon.props.className, 'h-4', 'w-4', 'mr-1'),
                })}
                <div>{name}</div>
              </Radio.Item>
            );
          })}
        </Radio.Root>
      </div>
      <div className="mt-12">
        <FieldHeader className="mb-1">Website</FieldHeader>
        <Input
          className="w-full mt-2"
          placeholder="e.g. https://www.realms.today"
          value={props.websiteUrl || ''}
          onChange={(e) => {
            const value = e.currentTarget.value || null;
            props.onWebsiteUrlChange?.(value);
          }}
        />
      </div>
      <div className="mt-8">
        <FieldHeader className="mb-1">Documentation</FieldHeader>
        <Input
          className="w-full mt-2"
          placeholder="e.g. https://docs.realms.today"
          value={props.documentation?.url || ''}
          onChange={(e) => {
            const value = e.currentTarget.value;

            props.onDocumentationChange?.(
              value
                ? {
                    title: 'Docs',
                    url: value,
                  }
                : null,
            );
          }}
        />
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
        <div>
          <FieldHeader className="mb-1">Twitter</FieldHeader>
          <Input
            className="w-full mt-2"
            placeholder="e.g. @realms_daos"
            value={props.twitterHandle || ''}
            onChange={(e) => {
              const value = e.currentTarget.value || null;
              props.onTwitterHandleChange?.(value);
            }}
          />
        </div>
        <div>
          <FieldHeader className="mb-1">Discord</FieldHeader>
          <Input
            className="w-full mt-2"
            placeholder="e.g. https://discord.com/realms"
            value={props.discordUrl || ''}
            onChange={(e) => {
              const value = e.currentTarget.value || null;
              props.onDiscordUrlChange?.(value);
            }}
          />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
        <div>
          <FieldHeader className="mb-1">Github</FieldHeader>
          <Input
            className="w-full mt-2"
            placeholder="e.g. https://github.com/realms"
            value={props.githubUrl || ''}
            onChange={(e) => {
              const value = e.currentTarget.value || null;
              props.onGithubUrlChange?.(value);
            }}
          />
        </div>
        <div>
          <FieldHeader className="mb-1">Instagram</FieldHeader>
          <Input
            className="w-full mt-2"
            placeholder="e.g. https://instagram.com/realms"
            value={props.instagramUrl || ''}
            onChange={(e) => {
              const value = e.currentTarget.value || null;
              props.onInstagramUrlChange?.(value);
            }}
          />
        </div>
      </div>
      <div className="mt-8">
        <FieldHeader className="mb-1">Token Mint Address</FieldHeader>
        <FieldDescription>
          If you have a public token that users can purchase, please enter the
          public key of the token's mint.
        </FieldDescription>
        <Input
          className="w-full mt-2"
          placeholder="e.g. H41XHe9fPDaogJMMhGNyi6LREuhVsvaC9rFpSkTFRitS"
          value={props.tokenMintStr || ''}
          onChange={(e) => {
            const value = e.currentTarget.value || null;
            props.onTokenMintStrChange?.(value);
          }}
        />
        {props.tokenIsValid === false && (
          <div className="text-right text-xs text-rose-500 mt-1">
            Not a valid token mint address
          </div>
        )}
      </div>
    </section>
  );
}
