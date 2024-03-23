import React, { FC } from 'react';

import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import { PLUGIN_DISPLAY_NAMES } from '@hub/components/EditRealmConfig/VotingStructureSelector/index';
import { ValueBlock } from '@hub/components/EditWalletRules/ValueBlock';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  previousPlugin: string;
  chainingEnabled: boolean;
  onChange(value: boolean): void;
}

const pluginProgramIdToName = (plugin: string) =>
  PLUGIN_DISPLAY_NAMES[plugin] ?? plugin;

// A dropdown of all the available Civic Passes
const ChainToggle: FC<{
  className?: string;
  previousPlugin: string;
  chainingEnabled: boolean;
  onChange(value: boolean): void;
}> = (props) => {
  return (
    <ValueBlock
      className="mt-12"
      title={`Chain this plugin with the ${pluginProgramIdToName(
        props.previousPlugin,
      )}?`}
      description="Votes will be handled by all plugins in the chain"
    >
      <ButtonToggle
        value={props.chainingEnabled}
        onChange={(value) => {
          props.onChange(value);
        }}
      />
    </ValueBlock>
  );
};

export function ChainToggleConfigurator(props: Props) {
  return (
    <div className={props.className}>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 h-24 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <ChainToggle {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}
