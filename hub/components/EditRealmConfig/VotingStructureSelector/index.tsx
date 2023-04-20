import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { produce } from 'immer';
import { useEffect, useRef, useState } from 'react';

import { Config } from '../fetchConfig';
import cx from '@hub/lib/cx';

import { Custom } from './Custom';
import { NFT } from './NFT';

export const DEFAULT_NFT_CONFIG = {
  votingProgramId: new PublicKey(
    'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw',
  ),
  maxVotingProgramId: new PublicKey(
    'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw',
  ),
};

export const DEFAULT_VSR_CONFIG = {
  votingProgramId: new PublicKey('vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ'),
  maxVotingProgramId: undefined,
};

export const DEFAULT_CIVIC_CONFIG = {
  votingProgramId: new PublicKey(
    'GgathUhdrCWRHowoRKACjgWhYHfxCEdBi5ViqYN6HVxk',
  ),
  maxVotingProgramId: undefined,
};

const itemStyles = cx(
  'border',
  'cursor-pointer',
  'gap-x-4',
  'grid-cols-[100px,1fr,20px]',
  'grid',
  'h-14',
  'items-center',
  'px-4',
  'rounded-md',
  'text-left',
  'transition-colors',
  'dark:bg-neutral-800',
  'dark:border-neutral-700',
  'dark:hover:bg-neutral-700',
);

const labelStyles = cx('font-700', 'dark:text-neutral-50');
const descriptionStyles = cx('dark:text-neutral-400');
const iconStyles = cx('fill-neutral-500', 'h-5', 'transition-transform', 'w-4');

interface Props {
  allowNFT?: boolean;
  allowCivic?: boolean;
  allowVSR?: boolean;
  className?: string;
  communityMint: Config['communityMint'];
  currentStructure: {
    votingProgramId?: PublicKey;
    maxVotingProgramId?: PublicKey;
    nftCollection?: PublicKey;
    nftCollectionSize?: number;
    nftCollectionWeight?: BN;
  };
  structure: {
    votingProgramId?: PublicKey;
    maxVotingProgramId?: PublicKey;
    nftCollection?: PublicKey;
    nftCollectionSize?: number;
    nftCollectionWeight?: BN;
  };
  onChange?(value: {
    votingProgramId?: PublicKey;
    maxVotingProgramId?: PublicKey;
    nftCollection?: PublicKey;
    nftCollectionSize?: number;
    nftCollectionWeight?: BN;
  }): void;
}

function areConfigsEqual(a: Props['structure'], b: Props['structure']) {
  if (
    (a.maxVotingProgramId && !b.maxVotingProgramId) ||
    (!a.maxVotingProgramId && b.maxVotingProgramId)
  ) {
    return false;
  }

  if (
    a.maxVotingProgramId &&
    b.maxVotingProgramId &&
    !a.maxVotingProgramId.equals(b.maxVotingProgramId)
  ) {
    return false;
  }

  if (
    (a.votingProgramId && !b.votingProgramId) ||
    (!a.votingProgramId && b.votingProgramId)
  ) {
    return false;
  }

  if (
    a.votingProgramId &&
    b.votingProgramId &&
    !a.votingProgramId.equals(b.votingProgramId)
  ) {
    return false;
  }

  return true;
}

function isNFTConfig(config: Props['structure']) {
  return areConfigsEqual(config, DEFAULT_NFT_CONFIG);
}

function isVSRConfig(config: Props['structure']) {
  return areConfigsEqual(config, DEFAULT_VSR_CONFIG);
}

function isCivicConfig(config: Props['structure']) {
  return areConfigsEqual(config, DEFAULT_CIVIC_CONFIG);
}

function isCustomConfig(config: Props['structure']) {
  return !isNFTConfig(config) && !isVSRConfig(config) && !isCivicConfig(config);
}

export function getLabel(value: Props['structure']): string {
  if (isNFTConfig(value)) {
    return 'NFT';
  }

  if (isVSRConfig(value)) {
    return 'VSR';
  }

  if (isCivicConfig(value)) {
    return 'Civic';
  }

  return 'Custom';
}

function getDescription(value: Props['structure']): string {
  if (isNFTConfig(value)) {
    return 'Voting enabled and weighted based on NFTs owned';
  }

  if (isVSRConfig(value)) {
    return 'Locked tokens (VeTokens)';
  }

  if (isCivicConfig(value)) {
    return 'Governance based on Civic verification';
  }

  return 'Add a custom program ID for governance structure';
}

export function VotingStructureSelector(props: Props) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const [isDefault, setIsDefault] = useState(
    !props.currentStructure.maxVotingProgramId &&
      !props.structure.votingProgramId,
  );
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (trigger.current) {
      setWidth(trigger.current.clientWidth);
    } else {
      setWidth(0);
    }
  }, [trigger, open]);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <div>
        <DropdownMenu.Trigger
          className={cx(
            itemStyles,
            props.className,
            open && 'border dark:border-white/40',
          )}
          ref={trigger}
        >
          <div className={labelStyles}>
            {areConfigsEqual({}, props.structure) && isDefault
              ? 'Default'
              : getLabel(props.structure)}
          </div>
          <div className={descriptionStyles}>
            {areConfigsEqual({}, props.structure) && isDefault
              ? 'Governance is based on token ownership'
              : getDescription(props.structure)}
          </div>
          <ChevronDownIcon className={cx(iconStyles, open && '-rotate-180')} />
        </DropdownMenu.Trigger>
        {isCustomConfig(props.structure) && !isDefault && (
          <Custom
            className="mt-2"
            maxVotingProgramId={props.structure.maxVotingProgramId}
            votingProgramId={props.structure.votingProgramId}
            onVotingProgramIdChange={(value) => {
              const newConfig = produce({ ...props.structure }, (data) => {
                data.votingProgramId = value || undefined;
                data.nftCollection = undefined;
              });

              props.onChange?.(newConfig);
            }}
            onMaxVotingProgramIdChange={(value) => {
              const newConfig = produce({ ...props.structure }, (data) => {
                data.maxVotingProgramId = value || undefined;
                data.nftCollection = undefined;
              });

              props.onChange?.(newConfig);
            }}
          />
        )}
        {isNFTConfig(props.structure) && (
          <NFT
            className="mt-2"
            communityMint={props.communityMint}
            currentNftCollection={props.currentStructure.nftCollection}
            nftCollection={props.structure.nftCollection}
            nftCollectionSize={props.structure.nftCollectionSize || 0}
            nftCollectionWeight={
              props.structure.nftCollectionWeight || new BN(0)
            }
            onCollectionChange={(value) => {
              const newConfig = produce({ ...props.structure }, (data) => {
                data.nftCollection = value || undefined;
              });

              props.onChange?.(newConfig);
            }}
            onCollectionSizeChange={(value) => {
              const newConfig = produce({ ...props.structure }, (data) => {
                data.nftCollectionSize = value;
              });

              props.onChange?.(newConfig);
            }}
            onCollectionWeightChange={(value) => {
              const newConfig = produce({ ...props.structure }, (data) => {
                data.nftCollectionWeight = value;
              });

              props.onChange?.(newConfig);
            }}
          />
        )}
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            // weo weo z-index crap
            className="dark space-y-0.5 z-20"
            sideOffset={2}
            style={{ width }}
          >
            {([
              ...(props.allowCivic ? [DEFAULT_CIVIC_CONFIG] : []),
              ...(props.allowNFT ? [DEFAULT_NFT_CONFIG] : []),
              ...(props.allowVSR ? [DEFAULT_VSR_CONFIG] : []),
              ...(isCustomConfig(props.currentStructure)
                ? [props.currentStructure]
                : [{}]),
              'default',
            ] as const)
              .filter((config) => {
                if (typeof config === 'string') {
                  return !areConfigsEqual({}, props.structure);
                }

                return !areConfigsEqual(config, props.structure);
              })
              .map((config, i) => (
                <DropdownMenu.Item
                  className={cx(
                    itemStyles,
                    'w-full',
                    'focus:outline-none',
                    'dark:focus:bg-neutral-700',
                  )}
                  key={i}
                  onClick={() => {
                    if (typeof config === 'string') {
                      props.onChange?.({});
                      setIsDefault(true);
                    } else {
                      props.onChange?.(config);
                      setIsDefault(false);
                    }
                  }}
                >
                  <div className={labelStyles}>
                    {typeof config === 'string' ? 'Default' : getLabel(config)}
                  </div>
                  <div className={descriptionStyles}>
                    {typeof config === 'string'
                      ? 'Governance is based on token ownership'
                      : getDescription(config)}
                  </div>
                </DropdownMenu.Item>
              ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </div>
    </DropdownMenu.Root>
  );
}
