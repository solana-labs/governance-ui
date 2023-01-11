import BuildingIcon from '@carbon/icons-react/lib/Building';
import ChemistryIcon from '@carbon/icons-react/lib/Chemistry';
import TimeIcon from '@carbon/icons-react/lib/Time';
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import { BigNumber } from 'bignumber.js';

import { MAX_NUM } from '../constants';
import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SummaryItem } from '../SummaryItem';
import { CommunityRules, CouncilRules } from '../types';
import { getLabel } from '../VoteTippingSelector';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { ntext } from '@hub/lib/ntext';

function diff<T extends { [key: string]: unknown }>(existing: T, changed: T) {
  const diffs = {} as {
    [K in keyof T]: [T[K], T[K]];
  };

  for (const key of Object.keys(existing) as (keyof T)[]) {
    const existingValue = existing[key];
    const changedValue = changed[key];

    if (
      BigNumber.isBigNumber(existingValue) &&
      BigNumber.isBigNumber(changedValue)
    ) {
      if (!existingValue.isEqualTo(changedValue)) {
        diffs[key] = [existingValue, changedValue];
      }
    } else if (key === 'communityVetoQuorum') {
      if (changed['communityHasVeto']) {
        if (existingValue !== changedValue) {
          diffs[key] = [existingValue, changedValue];
        }
      }
    } else if (key === 'councilVetoQuorum') {
      if (changed['councilHasVeto']) {
        if (existingValue !== changedValue) {
          diffs[key] = [existingValue, changedValue];
        }
      }
    } else {
      if (existingValue !== changedValue) {
        diffs[key] = [existingValue, changedValue];
      }
    }
  }

  return diffs;
}

interface Props {
  className?: string;
  communityRules: CommunityRules;
  coolOffHours: number;
  councilRules: CouncilRules;
  currentCommunityRules: CommunityRules;
  currentCoolOffHours: number;
  currentCouncilRules: CouncilRules;
  currentDepositExemptProposalCount: number;
  currentMaxVoteDays: number;
  currentMinInstructionHoldupDays: number;
  depositExemptProposalCount: number;
  maxVoteDays: number;
  minInstructionHoldupDays: number;
}

export function UpdatesList(props: Props) {
  const currentVotingDuration = {
    coolOffHours: props.currentCoolOffHours,
    maxVoteDays: props.currentMaxVoteDays,
  };

  const currentAdvancedSettings = {
    depositExemptProposalCount: props.currentDepositExemptProposalCount,
    minInstructionHoldupDays: props.currentMinInstructionHoldupDays,
  };

  const newVotingDuration = {
    coolOffHours: props.coolOffHours,
    maxVoteDays: props.maxVoteDays,
  };

  const newAdvancedSettings = {
    depositExemptProposalCount: props.depositExemptProposalCount,
    minInstructionHoldupDays: props.minInstructionHoldupDays,
  };

  const votingDurationDiff = diff(currentVotingDuration, newVotingDuration);
  const communityDetailsDiff = diff(
    props.currentCommunityRules,
    props.communityRules,
  );
  const councilDetailsDiff = diff(
    (props.currentCouncilRules || {}) as NonNullable<CouncilRules>,
    (props.councilRules || {}) as NonNullable<CouncilRules>,
  );
  const advancedSettingsDiff = diff(
    currentAdvancedSettings,
    newAdvancedSettings,
  );

  if (
    Object.keys(votingDurationDiff).length === 0 &&
    Object.keys(communityDetailsDiff).length === 0 &&
    Object.keys(councilDetailsDiff).length === 0 &&
    Object.keys(advancedSettingsDiff).length === 0
  ) {
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
      {!!Object.keys(votingDurationDiff).length && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<TimeIcon />}
            text="Voting Duration"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {!!votingDurationDiff.maxVoteDays?.length && (
              <SummaryItem
                label="Total Voting Duration"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {votingDurationDiff.maxVoteDays[1]}{' '}
                      {ntext(votingDurationDiff.maxVoteDays[1], 'hour')}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {votingDurationDiff.maxVoteDays[0]}{' '}
                      {ntext(votingDurationDiff.maxVoteDays[0], 'hour')}
                    </div>
                  </div>
                }
              />
            )}
            {!!votingDurationDiff.coolOffHours?.length && (
              <SummaryItem
                label="Cool-Off Voting Time"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {votingDurationDiff.coolOffHours[1]}{' '}
                      {ntext(votingDurationDiff.coolOffHours[1], 'hour')}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {votingDurationDiff.coolOffHours[0]}{' '}
                      {ntext(votingDurationDiff.coolOffHours[0], 'hour')}
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}
      {!!Object.keys(communityDetailsDiff).length && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<UserMultipleIcon />}
            text="Community Details"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {!!communityDetailsDiff.votingPowerToCreateProposals?.length &&
              (props.currentCommunityRules.votingPowerToCreateProposals.isEqualTo(
                MAX_NUM,
              ) ||
                props.currentCommunityRules.votingPowerToCreateProposals.isEqualTo(
                  MAX_NUM,
                )) && (
                <SummaryItem
                  label="Allow community members to create proposals"
                  value={
                    <div className="flex items-baseline">
                      <div>
                        {communityDetailsDiff.votingPowerToCreateProposals[1].isLessThan(
                          MAX_NUM,
                        )
                          ? 'Yes'
                          : 'No'}
                      </div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {communityDetailsDiff.votingPowerToCreateProposals[0].isLessThan(
                          MAX_NUM,
                        )
                          ? 'Yes'
                          : 'No'}
                      </div>
                    </div>
                  }
                />
              )}
            {!!communityDetailsDiff.votingPowerToCreateProposals?.length && (
              <SummaryItem
                label="Minimum amount of community tokens required to create a proposal"
                value={
                  <div>
                    <div>
                      {formatNumber(
                        communityDetailsDiff.votingPowerToCreateProposals[1],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        communityDetailsDiff.votingPowerToCreateProposals[1].toNumber(),
                        'token',
                      )}
                    </div>
                    <div className="text-base text-neutral-500 line-through">
                      {formatNumber(
                        communityDetailsDiff.votingPowerToCreateProposals[0],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        communityDetailsDiff.votingPowerToCreateProposals[0].toNumber(),
                        'token',
                      )}
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.quorumPercent?.length && (
              <SummaryItem
                label="Community Voting Quorum"
                value={
                  <div className="flex items-baseline">
                    <div>{communityDetailsDiff.quorumPercent[1]}%</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {communityDetailsDiff.quorumPercent[0]}%
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.voteTipping?.length && (
              <SummaryItem
                label="Community Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    <div>{getLabel(communityDetailsDiff.voteTipping[1])}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {getLabel(communityDetailsDiff.voteTipping[0])}
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.canVeto?.length && (
              <SummaryItem
                label="Community Veto Power over Council Proposals?"
                value={
                  <div className="flex items-baseline">
                    <div>{communityDetailsDiff.canVeto[1] ? 'Yes' : 'No'}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {communityDetailsDiff.canVeto[0] ? 'Yes' : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {props.communityRules.canVeto &&
              !!communityDetailsDiff.vetoQuorumPercent?.length && (
                <SummaryItem
                  label="Community Veto Voting Quorum"
                  value={
                    <div className="flex items-baseline">
                      <div>
                        {communityDetailsDiff.vetoQuorumPercent[1] || 0}%
                      </div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {communityDetailsDiff.vetoQuorumPercent[0] || 0}%
                      </div>
                    </div>
                  }
                />
              )}
          </div>
        </div>
      )}
      {!!Object.keys(councilDetailsDiff).length && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<BuildingIcon />}
            text="Council Details"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {!!councilDetailsDiff.votingPowerToCreateProposals?.length &&
              (props.currentCouncilRules?.votingPowerToCreateProposals.isEqualTo(
                MAX_NUM,
              ) ||
                props.currentCouncilRules?.votingPowerToCreateProposals.isEqualTo(
                  MAX_NUM,
                )) && (
                <SummaryItem
                  label="Allow council members to create proposals"
                  value={
                    <div className="flex items-baseline">
                      <div>
                        {councilDetailsDiff.votingPowerToCreateProposals[1].isLessThan(
                          MAX_NUM,
                        )
                          ? 'Yes'
                          : 'No'}
                      </div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {councilDetailsDiff.votingPowerToCreateProposals[0].isLessThan(
                          MAX_NUM,
                        )
                          ? 'Yes'
                          : 'No'}
                      </div>
                    </div>
                  }
                />
              )}
            {!!councilDetailsDiff.votingPowerToCreateProposals?.length && (
              <SummaryItem
                label="Minimum amount of council tokens required to create a proposal"
                value={
                  <div>
                    <div>
                      {formatNumber(
                        councilDetailsDiff.votingPowerToCreateProposals[1],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        councilDetailsDiff.votingPowerToCreateProposals[1].toNumber(),
                        'token',
                      )}
                    </div>
                    <div className="text-base text-neutral-500 line-through">
                      {formatNumber(
                        councilDetailsDiff.votingPowerToCreateProposals[0],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        councilDetailsDiff.votingPowerToCreateProposals[0].toNumber(),
                        'token',
                      )}
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.quorumPercent?.length && (
              <SummaryItem
                label="Council Voting Quorum"
                value={
                  <div className="flex items-baseline">
                    <div>{councilDetailsDiff.quorumPercent[1]}%</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {councilDetailsDiff.quorumPercent[0]}%
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.voteTipping?.length && (
              <SummaryItem
                label="Council Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    <div>{getLabel(councilDetailsDiff.voteTipping[1])}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {getLabel(councilDetailsDiff.voteTipping[0])}
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.canVeto?.length && (
              <SummaryItem
                label="Council Veto Power over Community Proposals?"
                value={
                  <div className="flex items-baseline">
                    <div>{councilDetailsDiff.canVeto[1] ? 'Yes' : 'No'}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {councilDetailsDiff.canVeto[0] ? 'Yes' : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {props.councilRules?.canVeto &&
              !!councilDetailsDiff.vetoQuorumPercent?.length && (
                <SummaryItem
                  label="Council Veto Voting Quorum"
                  value={
                    <div className="flex items-baseline">
                      <div>{councilDetailsDiff.vetoQuorumPercent[1] || 0}%</div>
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {councilDetailsDiff.vetoQuorumPercent[0] || 0}%
                      </div>
                    </div>
                  }
                />
              )}
          </div>
        </div>
      )}
      {!!Object.keys(advancedSettingsDiff).length && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<ChemistryIcon />}
            text="Advanced Options"
          />
          {!!advancedSettingsDiff.depositExemptProposalCount?.length && (
            <SummaryItem
              label="The amount of proposals a member can create without a deposit."
              value={
                <div className="flex items-baseline">
                  <div>
                    {advancedSettingsDiff.depositExemptProposalCount[1]}
                  </div>
                  <div className="ml-3 text-base text-neutral-500 line-through">
                    {advancedSettingsDiff.depositExemptProposalCount[0]}
                  </div>
                </div>
              }
            />
          )}
          {!!advancedSettingsDiff.minInstructionHoldupDays?.length && (
            <SummaryItem
              label="Minimum Instruction Holdup Time"
              value={
                <div className="flex items-baseline">
                  <div>
                    {advancedSettingsDiff.minInstructionHoldupDays[1]}{' '}
                    {ntext(
                      advancedSettingsDiff.minInstructionHoldupDays[1],
                      'day',
                    )}
                  </div>
                  <div className="ml-3 text-base text-neutral-500 line-through">
                    {advancedSettingsDiff.minInstructionHoldupDays[0]}{' '}
                    {ntext(
                      advancedSettingsDiff.minInstructionHoldupDays[0],
                      'day',
                    )}
                  </div>
                </div>
              }
            />
          )}
        </div>
      )}
    </SectionBlock>
  );
}
