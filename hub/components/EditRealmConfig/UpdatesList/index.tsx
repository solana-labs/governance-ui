import EditIcon from '@carbon/icons-react/lib/Edit';
import EventsIcon from '@carbon/icons-react/lib/Events';
import RuleIcon from '@carbon/icons-react/lib/Rule';
import ScaleIcon from '@carbon/icons-react/lib/Scale';
import {
  MintMaxVoteWeightSourceType,
  MintMaxVoteWeightSource,
} from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import BN from 'bn.js';

import { Config } from '../fetchConfig';
import { getLabel } from '../TokenTypeSelector';
import {
  DEFAULT_NFT_CONFIG,
  DEFAULT_VSR_CONFIG,
  DEFAULT_CIVIC_CONFIG,
} from '../VotingStructureSelector';
import { SectionBlock } from '@hub/components/EditWalletRules/SectionBlock';
import { SectionHeader } from '@hub/components/EditWalletRules/SectionHeader';
import { SummaryItem } from '@hub/components/EditWalletRules/SummaryItem';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

const MAX_NUM = new BN('18446744073709551615');

export function buildUpdates(config: Config) {
  return {
    minCommunityTokensToCreateGovernance:
      config.config.minCommunityTokensToCreateGovernance,
    communityTokenType: config.configAccount.communityTokenConfig.tokenType,
    councilTokenType: config.configAccount.councilTokenConfig.tokenType,
    communityVotingPlugin:
      config.configAccount.communityTokenConfig.voterWeightAddin,
    communityMaxVotingPlugin:
      config.configAccount.communityTokenConfig.maxVoterWeightAddin,
    councilVotingPlugin:
      config.configAccount.councilTokenConfig.voterWeightAddin,
    councilMaxVotingPlugin:
      config.configAccount.councilTokenConfig.maxVoterWeightAddin,
    maxVoterWeightType: config.config.communityMintMaxVoteWeightSource.type,
    maxVoterWeightValue: config.config.communityMintMaxVoteWeightSource.value,
    nftCollection: config.nftCollection,
    nftCollectionSize: config.nftCollectionSize,
    nftCollectionWeight: config.nftCollectionWeight,
  };
}

export function diff<T extends { [key: string]: unknown }>(
  existing: T,
  changed: T,
) {
  const diffs = {} as {
    [K in keyof T]: [T[K], T[K]];
  };

  for (const key of Object.keys(existing) as (keyof T)[]) {
    const existingValue = existing[key];
    const changedValue = changed[key];

    if (
      existingValue instanceof PublicKey &&
      changedValue instanceof PublicKey
    ) {
      if (!existingValue.equals(changedValue)) {
        diffs[key] = [existingValue, changedValue];
      }
    } else if (BN.isBN(existingValue) && BN.isBN(changedValue)) {
      if (!existingValue.eq(changedValue)) {
        diffs[key] = [existingValue, changedValue];
      }
    } else {
      if (existingValue !== changedValue) {
        diffs[key] = [existingValue, changedValue];
      }
    }
  }

  return diffs;
}

function votingStructureText(
  votingPluginDiff: [PublicKey | undefined, PublicKey | undefined],
  maxVotingPluginDiff: [PublicKey | undefined, PublicKey | undefined],
) {
  let newText = 'Default';
  let existingText = 'Default';

  if (
    votingPluginDiff[0]?.equals(DEFAULT_NFT_CONFIG.votingProgramId) &&
    maxVotingPluginDiff[0]?.equals(DEFAULT_NFT_CONFIG.maxVotingProgramId)
  ) {
    existingText = 'NFT';
  } else if (
    votingPluginDiff[0]?.equals(DEFAULT_VSR_CONFIG.votingProgramId) &&
    typeof maxVotingPluginDiff[0] === 'undefined'
  ) {
    existingText = 'VSR';
  } else if (
    votingPluginDiff[0]?.equals(DEFAULT_CIVIC_CONFIG.votingProgramId) &&
    typeof maxVotingPluginDiff[0] === 'undefined'
  ) {
    existingText = 'Civic';
  } else if (votingPluginDiff[0] || maxVotingPluginDiff[0]) {
    existingText = 'Custom';
  }

  if (
    votingPluginDiff[1]?.equals(DEFAULT_NFT_CONFIG.votingProgramId) &&
    maxVotingPluginDiff[1]?.equals(DEFAULT_NFT_CONFIG.maxVotingProgramId)
  ) {
    newText = 'NFT';
  } else if (
    votingPluginDiff[1]?.equals(DEFAULT_VSR_CONFIG.votingProgramId) &&
    typeof maxVotingPluginDiff[1] === 'undefined'
  ) {
    newText = 'VSR';
  } else if (
    votingPluginDiff[1]?.equals(DEFAULT_CIVIC_CONFIG.votingProgramId) &&
    typeof maxVotingPluginDiff[1] === 'undefined'
  ) {
    newText = 'Civic';
  } else if (votingPluginDiff[1] || maxVotingPluginDiff[1]) {
    newText = 'Custom';
  }

  return [existingText, newText];
}

function voterWeightLabel(voterWeightType: MintMaxVoteWeightSourceType) {
  switch (voterWeightType) {
    case MintMaxVoteWeightSourceType.Absolute:
      return 'Absolute';
    case MintMaxVoteWeightSourceType.SupplyFraction:
      return 'Supply Fraction';
  }
}

interface Props {
  className?: string;
  config: Config;
  currentConfig: Config;
}

export function UpdatesList(props: Props) {
  const updates = diff(
    buildUpdates(props.currentConfig),
    buildUpdates(props.config),
  );

  const hasCommunityUpdates =
    'communityTokenType' in updates ||
    'communityVotingPlugin' in updates ||
    'communityMaxVotingPlugin' in updates ||
    'nftCollection' in updates ||
    'nftCollectionSize' in updates ||
    'nftCollectionWeight' in updates;

  const hasCouncilUpdates =
    'councilTokenType' in updates ||
    'councilVotingPlugin' in updates ||
    'councilMaxVotingPlugin' in updates;

  if (Object.keys(updates).length === 0) {
    return (
      <SectionBlock
        className={cx(
          props.className,
          'grid',
          'place-items-center',
          'w-full',
          'h-52',
        )}
      >
        <div className="text-lg dark:text-white">
          There are no proposed changes
        </div>
      </SectionBlock>
    );
  }

  return (
    <SectionBlock className={cx('space-y-16', props.className)}>
      {'minCommunityTokensToCreateGovernance' in updates && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<EditIcon />}
            text="Manage Information"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {updates.minCommunityTokensToCreateGovernance[0].eq(MAX_NUM) &&
              !updates.minCommunityTokensToCreateGovernance[1].eq(MAX_NUM) && (
                <SummaryItem
                  label="Do you want the community to be able to manage this DAO?"
                  value={
                    <div className="flex items-baseline">
                      <div>Yes</div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        No
                      </div>
                    </div>
                  }
                />
              )}
            {!updates.minCommunityTokensToCreateGovernance[0].eq(MAX_NUM) &&
              updates.minCommunityTokensToCreateGovernance[1].eq(MAX_NUM) && (
                <SummaryItem
                  label="Do you want the community to be able to manage this DAO?"
                  value={
                    <div className="flex items-baseline">
                      <div>No</div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        Yes
                      </div>
                    </div>
                  }
                />
              )}
            {!updates.minCommunityTokensToCreateGovernance[1].eq(MAX_NUM) && (
              <SummaryItem
                label="What is the minimum number of community tokens needed to manage this DAO?"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {formatNumber(
                        new BigNumber(
                          updates.minCommunityTokensToCreateGovernance[1].toString(),
                        ).shiftedBy(
                          -props.config.communityMint.account.decimals,
                        ),
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        },
                      )}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {updates.minCommunityTokensToCreateGovernance[0].eq(
                        MAX_NUM,
                      )
                        ? 'Disabled'
                        : formatNumber(
                            new BigNumber(
                              updates.minCommunityTokensToCreateGovernance[0].toString(),
                            ).shiftedBy(
                              -props.config.communityMint.account.decimals,
                            ),
                            undefined,
                            {
                              maximumFractionDigits: 2,
                            },
                          )}
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}
      {hasCommunityUpdates && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<EventsIcon />}
            text="Community Structure"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {'communityTokenType' in updates && (
              <SummaryItem
                label="Token Configuration"
                value={
                  <div className="flex items-baseline">
                    <div>{getLabel(updates.communityTokenType[1])}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {getLabel(updates.communityTokenType[0])}
                    </div>
                  </div>
                }
              />
            )}
            {('communityVotingPlugin' in updates ||
              'communityMaxVotingPlugin' in updates) &&
              !(
                votingStructureText(
                  updates.communityVotingPlugin || [],
                  updates.communityMaxVotingPlugin || [],
                ).join(',') === 'Custom,Custom'
              ) && (
                <SummaryItem
                  label="Voting Structure"
                  value={
                    <div className="flex items-baseline">
                      <div>
                        {
                          votingStructureText(
                            updates.communityVotingPlugin || [],
                            updates.communityMaxVotingPlugin || [],
                          )[1]
                        }
                      </div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {
                          votingStructureText(
                            updates.communityVotingPlugin || [],
                            updates.communityMaxVotingPlugin || [],
                          )[0]
                        }
                      </div>
                    </div>
                  }
                />
              )}
            {('communityVotingPlugin' in updates ||
              'communityMaxVotingPlugin' in updates) &&
              votingStructureText(
                updates.communityVotingPlugin || [],
                updates.communityMaxVotingPlugin || [],
              ).join(',') === 'Custom,Custom' && (
                <>
                  {'communityVotingPlugin' in updates && (
                    <SummaryItem
                      label="Voting Structure (Voting Plugin)"
                      value={
                        <div className="flex items-baseline">
                          <div>
                            {updates.communityVotingPlugin[1]
                              ? abbreviateAddress(
                                  updates.communityVotingPlugin[1],
                                )
                              : 'No Plugin'}
                          </div>
                          <div className="ml-3 text-base text-neutral-500 line-through">
                            {updates.communityVotingPlugin[0]
                              ? abbreviateAddress(
                                  updates.communityVotingPlugin[0],
                                )
                              : 'No Plugin'}
                          </div>
                        </div>
                      }
                    />
                  )}
                  {'communityMaxVotingPlugin' in updates && (
                    <SummaryItem
                      label="Voting Structure (Max Voting Plugin)"
                      value={
                        <div className="flex items-baseline">
                          <div>
                            {updates.communityMaxVotingPlugin[1]
                              ? abbreviateAddress(
                                  updates.communityMaxVotingPlugin[1],
                                )
                              : 'No Plugin'}
                          </div>
                          <div className="ml-3 text-base text-neutral-500 line-through">
                            {updates.communityMaxVotingPlugin[0]
                              ? abbreviateAddress(
                                  updates.communityMaxVotingPlugin[0],
                                )
                              : 'No Plugin'}
                          </div>
                        </div>
                      }
                    />
                  )}
                </>
              )}
            {'nftCollection' in updates && (
              <SummaryItem
                label="NFT Voting Collection"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {updates.nftCollection[1]
                        ? abbreviateAddress(updates.nftCollection[1])
                        : 'No Collection'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {updates.nftCollection[0]
                        ? abbreviateAddress(updates.nftCollection[0])
                        : 'No Collection'}
                    </div>
                  </div>
                }
              />
            )}
            {'nftCollectionSize' in updates && (
              <SummaryItem
                label="NFT Voting Collection Size"
                value={
                  <div className="flex items-baseline">
                    <div>{updates.nftCollectionSize[1]}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {updates.nftCollectionSize[0]}
                    </div>
                  </div>
                }
              />
            )}
            {'nftCollectionWeight' in updates && (
              <SummaryItem
                label="NFT Voting Collection Weight"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {new BigNumber(updates.nftCollectionWeight[1].toString())
                        .shiftedBy(-props.config.communityMint.account.decimals)
                        .toFormat()}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {new BigNumber(updates.nftCollectionWeight[0].toString())
                        .shiftedBy(-props.config.communityMint.account.decimals)
                        .toFormat()}
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}
      {hasCouncilUpdates && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<RuleIcon />}
            text="Council Structure"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {'councilTokenType' in updates && (
              <SummaryItem
                label="Token Configuration"
                value={
                  <div className="flex items-baseline">
                    <div>{getLabel(updates.councilTokenType[1])}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {getLabel(updates.councilTokenType[0])}
                    </div>
                  </div>
                }
              />
            )}
            {('councilVotingPlugin' in updates ||
              'councilMaxVotingPlugin' in updates) &&
              !(
                votingStructureText(
                  updates.councilVotingPlugin,
                  updates.councilMaxVotingPlugin,
                ).join(',') === 'Custom,Custom'
              ) && (
                <SummaryItem
                  label="Voting Structure"
                  value={
                    <div className="flex items-baseline">
                      <div>
                        {
                          votingStructureText(
                            updates.councilVotingPlugin,
                            updates.councilMaxVotingPlugin,
                          )[1]
                        }
                      </div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {
                          votingStructureText(
                            updates.councilVotingPlugin,
                            updates.councilMaxVotingPlugin,
                          )[0]
                        }
                      </div>
                    </div>
                  }
                />
              )}
            {('councilVotingPlugin' in updates ||
              'councilMaxVotingPlugin' in updates) &&
              votingStructureText(
                updates.councilVotingPlugin || [],
                updates.councilMaxVotingPlugin || [],
              ).join(',') === 'Custom,Custom' && (
                <>
                  {'councilVotingPlugin' in updates && (
                    <SummaryItem
                      label="Voting Structure (Voting Plugin)"
                      value={
                        <div className="flex items-baseline">
                          <div>
                            {updates.councilVotingPlugin[1]
                              ? abbreviateAddress(
                                  updates.councilVotingPlugin[1],
                                )
                              : 'No Plugin'}
                          </div>
                          <div className="ml-3 text-base text-neutral-500 line-through">
                            {updates.councilVotingPlugin[0]
                              ? abbreviateAddress(
                                  updates.councilVotingPlugin[0],
                                )
                              : 'No Plugin'}
                          </div>
                        </div>
                      }
                    />
                  )}
                  {'councilMaxVotingPlugin' in updates && (
                    <SummaryItem
                      label="Voting Structure (Max Voting Plugin)"
                      value={
                        <div className="flex items-baseline">
                          <div>
                            {updates.councilMaxVotingPlugin[1]
                              ? abbreviateAddress(
                                  updates.councilMaxVotingPlugin[1],
                                )
                              : 'No Plugin'}
                          </div>
                          <div className="ml-3 text-base text-neutral-500 line-through">
                            {updates.councilMaxVotingPlugin[0]
                              ? abbreviateAddress(
                                  updates.councilMaxVotingPlugin[0],
                                )
                              : 'No Plugin'}
                          </div>
                        </div>
                      }
                    />
                  )}
                </>
              )}
          </div>
        </div>
      )}
      {('maxVoterWeightType' in updates ||
        'maxVoterWeightValue' in updates) && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<ScaleIcon />}
            text="Advanced Options"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {'maxVoterWeightType' in updates && (
              <SummaryItem
                label="Max Voter Weight Type"
                value={
                  <div className="flex items-baseline">
                    <div>{voterWeightLabel(updates.maxVoterWeightType[1])}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {voterWeightLabel(updates.maxVoterWeightType[0])}
                    </div>
                  </div>
                }
              />
            )}
            {'maxVoterWeightValue' in updates && (
              <SummaryItem
                label="Max Voter Weight Value"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {formatNumber(
                        props.config.config.communityMintMaxVoteWeightSource
                          .type === MintMaxVoteWeightSourceType.SupplyFraction
                          ? new BigNumber(
                              props.config.config.communityMintMaxVoteWeightSource
                                .getSupplyFraction()
                                .toString(),
                            )
                              .shiftedBy(
                                -MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS,
                              )
                              .multipliedBy(100)
                          : new BigNumber(
                              updates.maxVoterWeightValue[1].toString(),
                            ).shiftedBy(
                              -props.config.communityMint.account.decimals,
                            ),
                        undefined,
                        {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 0,
                        },
                      )}
                      {props.config.config.communityMintMaxVoteWeightSource
                        .type === MintMaxVoteWeightSourceType.SupplyFraction &&
                        '%'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {formatNumber(
                        props.currentConfig.config
                          .communityMintMaxVoteWeightSource.type ===
                          MintMaxVoteWeightSourceType.SupplyFraction
                          ? new BigNumber(
                              props.currentConfig.config.communityMintMaxVoteWeightSource
                                .getSupplyFraction()
                                .toString(),
                            )
                              .shiftedBy(
                                -MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS,
                              )
                              .multipliedBy(100)
                          : new BigNumber(
                              updates.maxVoterWeightValue[0].toString(),
                            ).shiftedBy(
                              -props.currentConfig.communityMint.account
                                .decimals,
                            ),
                      )}
                      {props.currentConfig.config
                        .communityMintMaxVoteWeightSource.type ===
                        MintMaxVoteWeightSourceType.SupplyFraction && '%'}
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}
    </SectionBlock>
  );
}
