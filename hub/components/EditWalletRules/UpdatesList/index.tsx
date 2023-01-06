import BuildingIcon from '@carbon/icons-react/lib/Building';
import ChemistryIcon from '@carbon/icons-react/lib/Chemistry';
import TimeIcon from '@carbon/icons-react/lib/Time';
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import type { VoteTipping } from '@solana/spl-governance';
import { BigNumber } from 'bignumber.js';

import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SummaryItem } from '../SummaryItem';
import { getLabel } from '../VoteTippingSelector';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { ntext } from '@hub/lib/ntext';

function diff<T extends { [key: string]: unknown }>(left: T, right: T) {
  const diffs = {} as {
    [K in keyof T]: [T[K], T[K]];
  };

  for (const key of Object.keys(left) as (keyof T)[]) {
    const leftValue = left[key];
    const rightValue = right[key];

    if (BigNumber.isBigNumber(leftValue) && BigNumber.isBigNumber(rightValue)) {
      if (!leftValue.isEqualTo(rightValue)) {
        diffs[key] = [leftValue, rightValue];
      }
    } else {
      if (leftValue !== rightValue) {
        diffs[key] = [leftValue, rightValue];
      }
    }
  }

  return diffs;
}

interface Props {
  className?: string;
  communityCanCreate: boolean;
  communityHasVeto: boolean;
  communityQuorumPercent: number;
  communityVoteTipping: VoteTipping;
  coolOffHours: number;
  councilCanCreate: boolean;
  councilHasVeto: boolean;
  councilQuorumPercent: number;
  councilVoteTipping: VoteTipping;
  depositExemptProposalCount: number;
  maxVoteDays: number;
  minCommunityPower: BigNumber;
  minCouncilPower: BigNumber;
  currentCommunityCanCreate: boolean;
  currentCommunityHasVeto: boolean;
  currentCommunityQuorumPercent: number;
  currentCommunityVoteTipping: VoteTipping;
  currentCoolOffHours: number;
  currentCouncilCanCreate: boolean;
  currentCouncilHasVeto: boolean;
  currentCouncilQuorumPercent: number;
  currentCouncilVoteTipping: VoteTipping;
  currentDepositExemptProposalCount: number;
  currentMaxVoteDays: number;
  currentMinCommunityPower: BigNumber;
  currentMinCouncilPower: BigNumber;
}

export function UpdatesList(props: Props) {
  const currentVotingDuration = {
    coolOffHours: props.currentCoolOffHours,
    maxVoteDays: props.currentMaxVoteDays,
  };

  const currentCommunityDetails = {
    communityCanCreate: props.currentCommunityCanCreate,
    communityHasVeto: props.currentCommunityHasVeto,
    communityQuorumPercent: props.currentCommunityQuorumPercent,
    communityVoteTipping: props.currentCommunityVoteTipping,
    minCommunityPower: props.currentMinCommunityPower,
  };

  const currentCouncilDetails = {
    councilCanCreate: props.currentCouncilCanCreate,
    councilHasVeto: props.currentCouncilHasVeto,
    councilQuorumPercent: props.currentCouncilQuorumPercent,
    councilVoteTipping: props.currentCouncilVoteTipping,
    minCouncilPower: props.currentMinCouncilPower,
  };

  const currentAdvancedSettings = {
    depositExemptProposalCount: props.currentDepositExemptProposalCount,
  };

  const newVotingDuration = {
    coolOffHours: props.coolOffHours,
    maxVoteDays: props.maxVoteDays,
  };

  const newCommunityDetails = {
    communityCanCreate: props.communityCanCreate,
    communityHasVeto: props.communityHasVeto,
    communityQuorumPercent: props.communityQuorumPercent,
    communityVoteTipping: props.communityVoteTipping,
    minCommunityPower: props.minCommunityPower,
  };

  const newCouncilDetails = {
    councilCanCreate: props.councilCanCreate,
    councilHasVeto: props.councilHasVeto,
    councilQuorumPercent: props.councilQuorumPercent,
    councilVoteTipping: props.councilVoteTipping,
    minCouncilPower: props.minCouncilPower,
  };

  const newAdvancedSettings = {
    depositExemptProposalCount: props.depositExemptProposalCount,
  };

  const votingDurationDiff = diff(currentVotingDuration, newVotingDuration);
  const communityDetailsDiff = diff(
    currentCommunityDetails,
    newCommunityDetails,
  );
  const councilDetailsDiff = diff(currentCouncilDetails, newCouncilDetails);
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
            {!!communityDetailsDiff.communityCanCreate?.length && (
              <SummaryItem
                label="Allow community members to create proposals"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {communityDetailsDiff.communityCanCreate[1]
                        ? 'Yes'
                        : 'No'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {communityDetailsDiff.communityCanCreate[0]
                        ? 'Yes'
                        : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.minCommunityPower?.length && (
              <SummaryItem
                label="Minimum amount of community tokens required to create a proposal"
                value={
                  <div>
                    <div>
                      {formatNumber(
                        communityDetailsDiff.minCommunityPower[1],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        communityDetailsDiff.minCommunityPower[1].toNumber(),
                        'token',
                      )}
                    </div>
                    <div className="text-base text-neutral-500 line-through">
                      {formatNumber(
                        communityDetailsDiff.minCommunityPower[0],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        communityDetailsDiff.minCommunityPower[0].toNumber(),
                        'token',
                      )}
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.communityQuorumPercent?.length && (
              <SummaryItem
                label="Community Voting Quorum"
                value={
                  <div className="flex items-baseline">
                    <div>{communityDetailsDiff.communityQuorumPercent[1]}%</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {communityDetailsDiff.communityQuorumPercent[0]}%
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.communityVoteTipping?.length && (
              <SummaryItem
                label="Community Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {getLabel(communityDetailsDiff.communityVoteTipping[1])}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {getLabel(communityDetailsDiff.communityVoteTipping[0])}
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.communityHasVeto?.length && (
              <SummaryItem
                label="Community Veto Power over Council Proposals?"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {communityDetailsDiff.communityHasVeto[1] ? 'Yes' : 'No'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {communityDetailsDiff.communityHasVeto[0] ? 'Yes' : 'No'}
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
            {!!councilDetailsDiff.councilCanCreate?.length && (
              <SummaryItem
                label="Allow council members to create proposals"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {councilDetailsDiff.councilCanCreate[1] ? 'Yes' : 'No'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {councilDetailsDiff.councilCanCreate[0] ? 'Yes' : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.minCouncilPower?.length && (
              <SummaryItem
                label="Minimum amount of council tokens required to create a proposal"
                value={
                  <div>
                    <div>
                      {formatNumber(
                        councilDetailsDiff.minCouncilPower[1],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        councilDetailsDiff.minCouncilPower[1].toNumber(),
                        'token',
                      )}
                    </div>
                    <div className="text-base text-neutral-500 line-through">
                      {formatNumber(
                        councilDetailsDiff.minCouncilPower[0],
                        undefined,
                        { maximumFractionDigits: 0 },
                      )}{' '}
                      {ntext(
                        councilDetailsDiff.minCouncilPower[0].toNumber(),
                        'token',
                      )}
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.councilQuorumPercent?.length && (
              <SummaryItem
                label="Council Voting Quorum"
                value={
                  <div className="flex items-baseline">
                    <div>{councilDetailsDiff.councilQuorumPercent[1]}%</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {councilDetailsDiff.councilQuorumPercent[0]}%
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.councilVoteTipping?.length && (
              <SummaryItem
                label="Council Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {getLabel(councilDetailsDiff.councilVoteTipping[1])}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {getLabel(councilDetailsDiff.councilVoteTipping[0])}
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.councilHasVeto?.length && (
              <SummaryItem
                label="Council Veto Power over Community Proposals?"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {councilDetailsDiff.councilHasVeto[1] ? 'Yes' : 'No'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {councilDetailsDiff.councilHasVeto[0] ? 'Yes' : 'No'}
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
        </div>
      )}
    </SectionBlock>
  );
}
