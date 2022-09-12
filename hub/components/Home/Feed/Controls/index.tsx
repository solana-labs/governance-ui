import DocumentAddIcon from '@carbon/icons-react/lib/DocumentAdd';
import LicenseDraftIcon from '@carbon/icons-react/lib/LicenseDraft';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Toolbar from '@radix-ui/react-toolbar';
import { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';
import { useState } from 'react';

import * as Button from '@hub/components/controls/Button';
import * as Dialog from '@hub/components/controls/Dialog';
import { Select } from '@hub/components/controls/Select';
import { NewPostEditor } from '@hub/components/NewPostEditor';
import { useJWT } from '@hub/hooks/useJWT';
import cx from '@hub/lib/cx';
import { FeedItemSort } from '@hub/types/FeedItemSort';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  realm: PublicKey;
  realmIconUrl?: string | null;
  realmName: string;
  realmUrlId: string;
  sort: FeedItemSort;
  onChangeSort?(sort: FeedItemSort): void;
}

export function Content(props: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [jwt] = useJWT();

  return (
    <Toolbar.Root
      className={cx(props.className, 'flex', 'items-center', 'space-x-2')}
    >
      <Toolbar.Button asChild>
        <Select
          choices={[
            {
              key: FeedItemSort.Relevance,
              label: 'Relevant',
              value: FeedItemSort.Relevance,
            },
            {
              key: FeedItemSort.New,
              label: 'Latest',
              value: FeedItemSort.New,
            },
          ]}
          selected={props.sort}
          onChange={(choice) => props.onChangeSort?.(choice.value)}
        />
      </Toolbar.Button>
      {jwt ? (
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Toolbar.Button asChild>
            <Dialog.Trigger asChild>
              <Button.Primary className="w-32" disabled={!jwt}>
                <LicenseDraftIcon className="h-4 w-4 mr-1.5" />
                <div>Post</div>
              </Button.Primary>
            </Dialog.Trigger>
          </Toolbar.Button>
          <Dialog.Portal>
            <Dialog.Overlay>
              <Dialog.Content>
                <Dialog.Close className="top-8 right-16" />
                <NewPostEditor
                  className="w-[840px] min-h-[675px] max-h-[calc(100vh-80px)] py-8 px-16 h-full"
                  realm={props.realm}
                  realmIconUrl={props.realmIconUrl}
                  realmName={props.realmName}
                  onPostCreated={(post) => {
                    router.push(`/realm/${props.realmUrlId}/${post.id}`);
                  }}
                />
              </Dialog.Content>
            </Dialog.Overlay>
          </Dialog.Portal>
        </Dialog.Root>
      ) : (
        <HoverCard.Root>
          <Toolbar.Button asChild>
            <HoverCard.Trigger asChild>
              <Button.Primary className="w-32" disabled>
                <LicenseDraftIcon className="h-4 w-4 mr-1.5" />
                <div>Post</div>
              </Button.Primary>
            </HoverCard.Trigger>
          </Toolbar.Button>
          <HoverCard.Portal>
            <HoverCard.Content
              className="p-3 bg-white rounded shadow-xl w-64 text-center"
              side="top"
            >
              <HoverCard.Arrow className="fill-white" />
              <div className="text-neutral-700 text-xs">
                You must be logged in to create a post
              </div>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      )}
      {jwt ? (
        <Toolbar.Button asChild>
          <Button.Secondary
            className="w-32"
            disabled={!jwt}
            onClick={() => router.push(`/dao/${props.realmUrlId}/proposal/new`)}
          >
            <DocumentAddIcon className="h-4 w-4 mr-1.5" />
            <div>Proposal</div>
          </Button.Secondary>
        </Toolbar.Button>
      ) : (
        <HoverCard.Root>
          <Toolbar.Button asChild>
            <HoverCard.Trigger asChild>
              <Button.Secondary className="w-32" disabled>
                <DocumentAddIcon className="h-4 w-4 mr-1.5" />
                <div>Proposal</div>
              </Button.Secondary>
            </HoverCard.Trigger>
          </Toolbar.Button>
          <HoverCard.Portal>
            <HoverCard.Content
              className="p-3 bg-white rounded shadow-xl w-72 text-center"
              side="top"
            >
              <HoverCard.Arrow className="fill-white" />
              <div className="text-neutral-700 text-xs">
                You must be logged in to create a proposal
              </div>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      )}
    </Toolbar.Root>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div className={cx(props.className, 'flex', 'items-center', 'space-x-2')}>
      <div className="h-10 w-24 rounded bg-neutral-200 animate-pulse" />
      <div className="h-10 w-32 rounded bg-neutral-200 animate-pulse" />
      <div className="h-10 w-32 rounded bg-neutral-200 animate-pulse" />
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div className={cx(props.className, 'flex', 'items-center', 'space-x-2')}>
      <div className="h-10 w-24 rounded bg-neutral-200" />
      <div className="h-10 w-32 rounded bg-neutral-200" />
      <div className="h-10 w-32 rounded bg-neutral-200" />
    </div>
  );
}
