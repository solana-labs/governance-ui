import ScaleIcon from '@carbon/icons-react/lib/Scale';
import {
  RealmConfig,
  MintMaxVoteWeightSourceType,
  MintMaxVoteWeightSource,
} from '@solana/spl-governance';
import { BigNumber } from 'bignumber.js';
import BN from 'bn.js';
import { produce } from 'immer';
import { clamp } from 'ramda';
import { useEffect } from 'react';

import { Config } from '../fetchConfig';
import { ButtonToggle } from '@hub/components/controls/ButtonToggle';
import { Input } from '@hub/components/controls/Input';
import { SectionBlock } from '@hub/components/EditWalletRules/SectionBlock';
import { SectionHeader } from '@hub/components/EditWalletRules/SectionHeader';
import { ValueBlock } from '@hub/components/EditWalletRules/ValueBlock';
import { formatNumber } from '@hub/lib/formatNumber';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    config: RealmConfig;
  }> {
  communityMint: Config['communityMint'];
  currentConfig: RealmConfig;
  className?: string;
}

export function AdvancedOptions(props: Props) {
  const isSupplyFraction =
    props.config.communityMintMaxVoteWeightSource.type ===
    MintMaxVoteWeightSourceType.SupplyFraction;

  useEffect(() => {
    const newConfig = produce({ ...props.config }, (data) => {
      data.communityMintMaxVoteWeightSource = new MintMaxVoteWeightSource({
        type: data.communityMintMaxVoteWeightSource.type,
        value:
          props.config.communityMintMaxVoteWeightSource.type ===
          props.currentConfig.communityMintMaxVoteWeightSource.type
            ? props.currentConfig.communityMintMaxVoteWeightSource.value
            : new BN(0),
      });
    });

    props.onConfigChange?.(newConfig);
  }, [isSupplyFraction]);

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<ScaleIcon />}
        text="Maximum Voter Weight"
      />
      <ValueBlock
        title="What type of community maximum voter weight do you want to use?"
        description="This determines the maximum voter weight used to calculate voting thresholds. Updating this option requires you to know the maximum supply of your governance token."
      >
        <ButtonToggle
          value={isSupplyFraction}
          valueFalseText="Absolute"
          valueTrueText="Supply Fraction"
          onChange={(value) => {
            const newValue = value
              ? MintMaxVoteWeightSourceType.SupplyFraction
              : MintMaxVoteWeightSourceType.Absolute;

            const newConfig = produce({ ...props.config }, (data) => {
              data.communityMintMaxVoteWeightSource = new MintMaxVoteWeightSource(
                {
                  type: newValue,
                  value: data.communityMintMaxVoteWeightSource.value,
                },
              );
            });

            props.onConfigChange?.(newConfig);
          }}
        />
      </ValueBlock>
      {props.config.communityMintMaxVoteWeightSource.type ===
        MintMaxVoteWeightSourceType.SupplyFraction && (
        <ValueBlock
          className="mt-12"
          title="What fraction of total supply should be your maximum voter weight?"
          description="This option determines the max voter weight as a fraction of the total circulating supply of the governance token."
        >
          <div>
            <div className="relative">
              <Input
                className="w-full pr-40"
                placeholder="e.g. 25"
                type="number"
                value={parseFloat(
                  props.config.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage(),
                ).toString()}
                onChange={(e) => {
                  const value = e.currentTarget.valueAsNumber;

                  const newConfig = produce({ ...props.config }, (data) => {
                    const percent =
                      value && !Number.isNaN(value) ? clamp(0, 100, value) : 0;

                    const newValue = new BigNumber(
                      MintMaxVoteWeightSource.SUPPLY_FRACTION_BASE.toString(),
                    )
                      .multipliedBy(percent)
                      .div(100);

                    data.communityMintMaxVoteWeightSource = new MintMaxVoteWeightSource(
                      {
                        type: data.communityMintMaxVoteWeightSource.type,
                        value: new BN(newValue.toString()),
                      },
                    );
                  });

                  props.onConfigChange?.(newConfig);
                }}
              />
              <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
                % of Total Supply
              </div>
            </div>
            <div className="flex items-center justify-end mt-1">
              {props.communityMint.account.supply.toString() !== '0' ? (
                <div className="text-xs text-neutral-500">
                  <span className="font-bold">
                    {props.config.communityMintMaxVoteWeightSource.isFullSupply()
                      ? formatNumber(
                          new BigNumber(
                            props.communityMint.account.supply.toString(),
                          ).shiftedBy(-props.communityMint.account.decimals),
                        )
                      : formatNumber(
                          new BigNumber(
                            props.communityMint.account.supply.toString(),
                          )
                            .shiftedBy(-props.communityMint.account.decimals)
                            .multipliedBy(
                              parseFloat(
                                props.config.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage(),
                              ),
                            )
                            .dividedBy(100),
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          },
                        )}
                  </span>{' '}
                  Community Tokens
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  <span className="font-bold">Note:</span> There are currently
                  no tokens in supply
                </div>
              )}
            </div>
          </div>
        </ValueBlock>
      )}
      {props.config.communityMintMaxVoteWeightSource.type ===
        MintMaxVoteWeightSourceType.Absolute && (
        <ValueBlock
          className="mt-12"
          title="What total supply should be your maximum voter weight?"
          description="This option determines the max voter weight as a an absolute value."
        >
          <div>
            <div className="relative">
              <Input
                className="w-full pr-40"
                placeholder="e.g. 25"
                type="number"
                value={new BigNumber(
                  props.config.communityMintMaxVoteWeightSource.value.toString(),
                )
                  .shiftedBy(-props.communityMint.account.decimals)
                  .toString()}
                onChange={(e) => {
                  const value = e.currentTarget.valueAsNumber;

                  const newConfig = produce({ ...props.config }, (data) => {
                    const newValue = value && !Number.isNaN(value) ? value : 0;

                    data.communityMintMaxVoteWeightSource = new MintMaxVoteWeightSource(
                      {
                        type: data.communityMintMaxVoteWeightSource.type,
                        value: new BN(
                          new BigNumber(newValue)
                            .shiftedBy(props.communityMint.account.decimals)
                            .toString(),
                        ),
                      },
                    );
                  });

                  props.onConfigChange?.(newConfig);
                }}
              />
              <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
                # of Tokens
              </div>
            </div>
            <div className="flex items-center justify-end mt-1">
              {props.communityMint.account.supply.toString() !== '0' ? (
                <div className="text-xs text-neutral-500">
                  <span className="font-bold">
                    {new BigNumber(
                      props.config.communityMintMaxVoteWeightSource.value.toString(),
                    )
                      .dividedBy(props.communityMint.account.supply.toString())
                      .multipliedBy(100)
                      .toFormat(2)}
                    %
                  </span>{' '}
                  of Community Tokens
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  <span className="font-bold">Note:</span> There are currently
                  no tokens in supply
                </div>
              )}
            </div>
          </div>
        </ValueBlock>
      )}
    </SectionBlock>
  );
}
