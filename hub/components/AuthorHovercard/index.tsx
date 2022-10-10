import Checkmark from '@carbon/icons-react/lib/Checkmark';
import CopyIcon from '@carbon/icons-react/lib/Copy';
import * as HoverCard from '@radix-ui/react-hover-card';
import type { PublicKey } from '@solana/web3.js';
import { useEffect, useState, useRef } from 'react';

import { AuthorAvatar } from '@hub/components/AuthorAvatar';
import { Civic as CivicIcon } from '@hub/components/icons/Civic';
import { Twitter as TwitterIcon } from '@hub/components/icons/Twitter';
import { useToast, ToastType } from '@hub/hooks/useToast';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

interface Props {
  asChild?: boolean;
  children: JSX.Element;
  civicAvatar?: null | string;
  civicHandle?: null | string;
  className?: string;
  publicKey: PublicKey;
  twitterAvatar?: null | string;
  twitterHandle?: null | string;
}

export function AuthorHovercard(props: Props) {
  const { publish } = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (copied && typeof window !== 'undefined') {
      timer.current = window.setTimeout(() => {
        setCopied(false);
      }, 1000);
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [copied]);

  const authorName =
    props.civicHandle ||
    props.twitterHandle ||
    abbreviateAddress(props.publicKey);

  const isTwitter =
    !!props.twitterHandle &&
    props.twitterHandle.slice(0, 4) !== props.publicKey.toBase58().slice(0, 4);

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild={props.asChild}>
        {props.children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className={cx(
            'bg-white',
            'drop-shadow-xl',
            'flex-col',
            'flex',
            'items-center',
            'p-4',
            'rounded',
            'w-64',
            'z-40',
          )}
          side="top"
          sideOffset={8}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <HoverCard.Arrow className="fill-white" />
          <AuthorAvatar
            author={{
              publicKey: props.publicKey,
              civicInfo: props.civicHandle
                ? {
                    avatarUrl: props.civicAvatar || null,
                    handle: props.civicHandle,
                    isVerified: false,
                  }
                : null,
              twitterInfo: props.twitterHandle
                ? {
                    avatarUrl: props.twitterAvatar || null,
                    handle: props.twitterHandle,
                  }
                : null,
            }}
            className="h-16 w-16 text-2xl"
          />
          <div className="flex items-center mt-0.5 h-5">
            {!!props.civicHandle ? (
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#EE795F] mr-1">
                <CivicIcon className="h-3 w-3 fill-white" />
              </div>
            ) : isTwitter ? (
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-sky-500 mr-1">
                <TwitterIcon className="h-3 w-3 fill-white" />
              </div>
            ) : null}
            <div className="text-sm text-neutral-900 font-bold">
              {authorName}
            </div>
          </div>
          <button
            className={cx(
              'border',
              'border-neutral-300',
              'flex',
              'group',
              'h-7',
              'items-center',
              'justify-center',
              'mt-2',
              'py-1.5',
              'rounded',
              'text-neutral-500',
              'text-xs',
              'tracking-normal',
              'transition-colors',
              'w-full',
              'hover:border-neutral-500',
              copied && 'border-emerald-500',
              copied && 'hover:border-emerald-500',
            )}
            onClick={async (e) => {
              e.stopPropagation();

              try {
                navigator.clipboard.writeText(props.publicKey.toBase58());
                setCopied(true);
              } catch (e) {
                publish({
                  type: ToastType.Error,
                  title: 'Could not copy address',
                  message: String(e),
                });
              }
            }}
          >
            {copied ? (
              <>
                <div className="text-emerald-500">Copied!</div>
                <Checkmark className="ml-1.5 h-3 w-3 fill-emerald-500" />
              </>
            ) : (
              <>
                <div>{abbreviateAddress(props.publicKey)}</div>
                <CopyIcon className="ml-1.5 h-3 w-3 fill-current" />
              </>
            )}
          </button>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
