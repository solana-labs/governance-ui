import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import type { PublicKey } from '@solana/web3.js';
import { produce } from 'immer';
import { TypeOf } from 'io-ts';
import { useState } from 'react';

import { AdvancedOptions } from '../AdvancedOptions';
import { CommunityStructure } from '../CommunityStructure';
import { CouncilStructure } from '../CouncilStructure';
import { Config } from '../fetchConfig';
import { getGovernanceResp } from '../gql';
import cx from '@hub/lib/cx';
import { FormProps } from '@hub/types/FormProps';

type CouncilRules = TypeOf<
  typeof getGovernanceResp
>['realmByUrlId']['governance']['councilTokenRules'];

interface Props
  extends FormProps<{
    config: Config;
  }> {
  className?: string;
  councilRules: CouncilRules;
  currentConfig: Config;
  walletAddress: PublicKey;
}

export function Form(props: Props) {
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);

  return (
    <article className={props.className}>
      <div className="text-5xl text-white font-semibold mb-4">
        You are changing the underlying structure of your organization.
      </div>
      <div className="text-neutral-300 mb-8">
        Updates to a realms’s config will create a proposal to be voted on on.
        If approved, the updates will become ready for execution.
      </div>
      <div
        className={cx(
          'border-rose-400',
          'border',
          'flex',
          'items-center',
          'mb-16',
          'px-8',
          'py-4',
          'rounded',
          'text-rose-400',
        )}
      >
        <WarningFilledIcon className="flex-shrink-0 h-6 w-6 fill-current mr-3" />
        <div>
          Be careful editing your Realm’s configuration. All changes are
          extremely consequential.
        </div>
      </div>
      <CommunityStructure
        className="mt-8"
        config={props.config.config}
        communityMint={props.config.communityMint}
        configAccount={props.config.configAccount}
        currentConfigAccount={props.currentConfig.configAccount}
        currentNftCollection={props.currentConfig.nftCollection}
        currentNftCollectionSize={props.currentConfig.nftCollectionSize}
        currentNftCollectionWeight={props.currentConfig.nftCollectionWeight}
        nftCollection={props.config.nftCollection}
        nftCollectionSize={props.config.nftCollectionSize}
        nftCollectionWeight={props.config.nftCollectionWeight}
        onConfigChange={(config) => {
          const newConfig = produce(props.config, (data) => {
            data.config = config;
          });

          props.onConfigChange?.(newConfig);
        }}
        onConfigAccountChange={(configAccount) => {
          const newConfig = produce(props.config, (data) => {
            data.configAccount = configAccount;
          });

          props.onConfigChange?.(newConfig);
        }}
        onNftCollectionChange={(nftCollection) => {
          const newConfig = produce(props.config, (data) => {
            data.nftCollection = nftCollection;
          });

          props.onConfigChange?.(newConfig);
        }}
        onNftCollectionSizeChange={(nftCollectionSize) => {
          const newConfig = produce(props.config, (data) => {
            data.nftCollectionSize = nftCollectionSize;
          });

          props.onConfigChange?.(newConfig);
        }}
        onNftCollectionWeightChange={(nftCollectionWeight) => {
          const newConfig = produce(props.config, (data) => {
            data.nftCollectionWeight = nftCollectionWeight;
          });

          props.onConfigChange?.(newConfig);
        }}
      />
      {!!props.councilRules && (
        <CouncilStructure
          className="mt-8"
          communityMint={props.config.communityMint}
          configAccount={props.config.configAccount}
          currentConfigAccount={props.currentConfig.configAccount}
          onConfigAccountChange={(configAccount) => {
            const newConfig = produce(props.config, (data) => {
              data.configAccount = configAccount;
            });

            props.onConfigChange?.(newConfig);
          }}
        />
      )}
      {typeof props.config.configAccount.communityTokenConfig
        .maxVoterWeightAddin === 'undefined' && (
        <div className="mt-16">
          <button
            className="flex items-center text-sm text-neutral-500"
            onClick={() => setShowAdvanceOptions((cur) => !cur)}
          >
            Advanced Options{' '}
            <ChevronDownIcon
              className={cx(
                'fill-current',
                'h-4',
                'transition-transform',
                'w-4',
                showAdvanceOptions && '-rotate-180',
              )}
            />
          </button>
          {showAdvanceOptions && (
            <AdvancedOptions
              className="mt-2.5"
              config={props.config.config}
              currentConfig={props.currentConfig.config}
              communityMint={props.config.communityMint}
              onConfigChange={(config) => {
                const newConfig = produce(props.config, (data) => {
                  data.config = config;
                });

                props.onConfigChange?.(newConfig);
              }}
            />
          )}
        </div>
      )}
    </article>
  );
}
