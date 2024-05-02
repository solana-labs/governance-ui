import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import { GATEWAY_PLUGINS_PKS, QV_PLUGINS_PKS } from '@constants/plugins';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Coefficients } from '@solana/governance-program-library';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { produce } from 'immer';

import { useEffect, useRef, useState } from 'react';

import { defaultPass } from '../../../../GatewayPlugin/config';
import { Config } from '../fetchConfig';
import { ChainToggleConfigurator } from '@hub/components/EditRealmConfig/VotingStructureSelector/ChainToggle';
import cx from '@hub/lib/cx';

import { DEFAULT_NFT_VOTER_PLUGIN } from '@tools/constants';

import { CivicConfigurator } from './CivicConfigurator';
import { Custom } from './Custom';
import { NFT } from './NFT';
import { QVConfigurator } from './QVConfigurator';

export const DEFAULT_NFT_CONFIG = {
  votingProgramId: new PublicKey(DEFAULT_NFT_VOTER_PLUGIN),
  maxVotingProgramId: new PublicKey(DEFAULT_NFT_VOTER_PLUGIN),
};

export const DEFAULT_VSR_CONFIG = {
  votingProgramId: new PublicKey('vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ'),
  maxVotingProgramId: undefined,
};

export const DEFAULT_CIVIC_CONFIG = {
  votingProgramId: new PublicKey(GATEWAY_PLUGINS_PKS[0]),
  maxVotingProgramId: undefined,
};

export const DEFAULT_QV_CONFIG = {
  votingProgramId: new PublicKey(QV_PLUGINS_PKS[0]),
  maxVotingProgramId: undefined, // the QV plugin does not use a max voting weight record.
};

const INITIAL_CUSTOM_CONFIG = {};

export const PLUGIN_DISPLAY_NAMES = {
  [DEFAULT_NFT_VOTER_PLUGIN]: 'NFT Plugin',
  [DEFAULT_VSR_CONFIG.votingProgramId.toBase58() || '']: 'VSR Plugin',
  [DEFAULT_CIVIC_CONFIG.votingProgramId.toBase58() || '']: 'Civic Plugin',
  [DEFAULT_QV_CONFIG.votingProgramId.toBase58() || '']: 'QV Plugin',
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

type VotingStructure = {
  votingProgramId?: PublicKey;
  maxVotingProgramId?: PublicKey;
  nftCollection?: PublicKey;
  nftCollectionSize?: number;
  nftCollectionWeight?: BN;
  civicPassType?: PublicKey;
  chainingEnabled?: boolean;
  qvCoefficients?: Coefficients;
};

interface Props {
  allowNFT?: boolean;
  allowCivic?: boolean;
  allowVSR?: boolean;
  allowQV?: boolean;
  className?: string;
  communityMint: Config['communityMint'];
  currentStructure: VotingStructure;
  structure: VotingStructure;
  onChange?(value: VotingStructure): void;
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

function isQVConfig(config: Props['structure']) {
  return areConfigsEqual(config, DEFAULT_QV_CONFIG);
}

// true if this plugin supports chaining with other plugins
function isChainablePlugin(config: Props['structure']) {
  return isCivicConfig(config) || isQVConfig(config);
}

function isDefaultConfig(config: Props['structure']) {
  return (
    Object.hasOwnProperty.call(config, 'votingProgramId') &&
    Object.hasOwnProperty.call(config, 'maxVotingProgramId') &&
    config.votingProgramId === undefined &&
    config.maxVotingProgramId === undefined
  );
}

function isCustomConfig(config: Props['structure']) {
  return (
    !isDefaultConfig(config) &&
    !isNFTConfig(config) &&
    !isVSRConfig(config) &&
    !isCivicConfig(config) &&
    !isQVConfig(config)
  );
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

  if (isQVConfig(value)) {
    return 'QV';
  }

  return 'Custom';
}

const getDefaults = (value: Props['structure']): Partial<Config> => {
  let result: Partial<Config> = {};

  if (isCivicConfig(value)) {
    result = {
      ...result,
      civicPassType: new PublicKey(defaultPass.value),
    };
  }

  return result;
};

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

  if (isQVConfig(value)) {
    return 'Quadratic voting';
  }

  return 'Add a custom program ID for governance structure';
}

const withoutUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;

export function VotingStructureSelector(props: Props) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const [isDefault, setIsDefault] = useState(
    !props.currentStructure.maxVotingProgramId &&
      !props.structure.votingProgramId,
  );
  console.log('in VotingStructureSelector', { props, isDefault });
  const trigger = useRef<HTMLButtonElement>(null);

  const savedConfig = withoutUndefined(props.structure);
  const currentConfig = withoutUndefined(props.currentStructure);

  // only show the chain toggle if the plugin supports chaining
  // and there is a previous plugin to chain with
  // and the current plugin is not the same as the previous plugin
  const shouldShowChainToggle =
    isChainablePlugin(props.structure) &&
    !!currentConfig.votingProgramId &&
    props.structure.votingProgramId?.toBase58() !==
      currentConfig.votingProgramId?.toBase58();

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
            {areConfigsEqual({}, savedConfig) && isDefault
              ? 'Default'
              : getLabel(savedConfig)}
          </div>
          <div className={descriptionStyles}>
            {areConfigsEqual({}, savedConfig) && isDefault
              ? 'Governance is based on token ownership'
              : getDescription(savedConfig)}
          </div>
          <ChevronDownIcon className={cx(iconStyles, open && '-rotate-180')} />
        </DropdownMenu.Trigger>
        {isCustomConfig(savedConfig) && !isDefault && (
          <Custom
            className="mt-2"
            maxVotingProgramId={savedConfig.maxVotingProgramId}
            votingProgramId={savedConfig.votingProgramId}
            onVotingProgramIdChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.votingProgramId = value || undefined;
                data.nftCollection = undefined;
                data.chainingEnabled = isChainablePlugin(data);
              });

              props.onChange?.(newConfig);
            }}
            onMaxVotingProgramIdChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.maxVotingProgramId = value || undefined;
                data.nftCollection = undefined;
              });

              props.onChange?.(newConfig);
            }}
          />
        )}
        {isNFTConfig(savedConfig) && (
          <NFT
            className="mt-2"
            communityMint={props.communityMint}
            currentNftCollection={currentConfig.nftCollection}
            nftCollection={savedConfig.nftCollection}
            nftCollectionSize={savedConfig.nftCollectionSize || 0}
            nftCollectionWeight={savedConfig.nftCollectionWeight || new BN(0)}
            onCollectionChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.nftCollection = value || undefined;
              });

              props.onChange?.(newConfig);
            }}
            onCollectionSizeChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.nftCollectionSize = value;
              });

              props.onChange?.(newConfig);
            }}
            onCollectionWeightChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.nftCollectionWeight = value;
              });

              props.onChange?.(newConfig);
            }}
          />
        )}
        {isQVConfig(savedConfig) && (
          <QVConfigurator
            className="mt-2"
            onCoefficientsChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.qvCoefficients = value ?? undefined;
              });
              props.onChange?.(newConfig);
            }}
          />
        )}
        {isCivicConfig(savedConfig) && (
          <CivicConfigurator
            className="mt-2"
            currentPassType={currentConfig.civicPassType}
            onPassTypeChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.civicPassType = value ?? undefined;
              });
              props.onChange?.(newConfig);
            }}
          />
        )}
        {shouldShowChainToggle && (
          <ChainToggleConfigurator
            chainingEnabled={savedConfig.chainingEnabled ?? false}
            previousPlugin={currentConfig.votingProgramId?.toBase58() || ''}
            onChange={(value) => {
              const newConfig = produce({ ...savedConfig }, (data) => {
                data.chainingEnabled = value;
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
              ...(props.allowQV ? [DEFAULT_QV_CONFIG] : []),
              ...(isCustomConfig(currentConfig)
                ? [currentConfig]
                : [INITIAL_CUSTOM_CONFIG]),
              'default',
            ] as const)
              // Show all options in the dropdown except the currently selected one
              .filter((config) => {
                if (typeof config === 'string') {
                  console.log(
                    'filter',
                    'default',
                    areConfigsEqual({}, savedConfig),
                  );
                  return !areConfigsEqual({}, savedConfig);
                }
                console.log(
                  'filter',
                  getLabel(config),
                  config,
                  areConfigsEqual(config, savedConfig),
                  'config === INITIAL_CUSTOM_CONFIG',
                  config === INITIAL_CUSTOM_CONFIG,
                );
                return (
                  config === INITIAL_CUSTOM_CONFIG ||
                  !areConfigsEqual(config, savedConfig)
                );
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
                      const changes = {
                        ...getDefaults(config), // add any default values (e.g. chainingEnabled)
                        ...config,
                      };
                      props.onChange?.(changes);
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
