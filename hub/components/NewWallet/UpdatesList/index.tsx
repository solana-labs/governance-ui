import BuildingIcon from '@carbon/icons-react/lib/Building';
import ChemistryIcon from '@carbon/icons-react/lib/Chemistry';
import TimeIcon from '@carbon/icons-react/lib/Time';
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';

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
    [K in keyof T]: [T[K] | null, T[K] | null];
  };

  for (const key of Object.keys(existing) as (keyof T)[]) {
    const existingValue = existing[key];
    const changedValue = changed[key];

    if (
      existingValue instanceof PublicKey &&
      changedValue instanceof PublicKey
    ) {
      continue;
    } else if (
      BigNumber.isBigNumber(existingValue) &&
      BigNumber.isBigNumber(changedValue)
    ) {
      if (!existingValue.isEqualTo(changedValue)) {
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

function unrestrictedVotingTimeText(days: number) {
  const hours = days * 24;
  const votingDays = Math.floor(hours / 24);
  const remainingHours = hours - votingDays * 24;

  return (
    `${votingDays} ${ntext(votingDays, 'day')}` +
    (remainingHours
      ? ` ${remainingHours} ${ntext(remainingHours, 'hour')}`
      : '')
  );
}

interface Props {
  className?: string;
  communityRules: CommunityRules;
  coolOffHours: number;
  councilRules: CouncilRules;
  initialCommunityRules: CommunityRules;
  currentCoolOffHours: number;
  initialCouncilRules: CouncilRules;
  currentDepositExemptProposalCount: number;
  currentBaseVoteDays: number;
  currentMinInstructionHoldupDays: number;
  depositExemptProposalCount: number;
  baseVoteDays: number;
  minInstructionHoldupDays: number;
}

export function UpdatesList(props: Props) {
  const currentVotingDuration = {
    coolOffHours: props.currentCoolOffHours,
    baseVoteDays: props.currentBaseVoteDays,
  };

  const currentAdvancedSettings = {
    depositExemptProposalCount: props.currentDepositExemptProposalCount,
    minInstructionHoldupDays: props.currentMinInstructionHoldupDays,
  };

  const newVotingDuration = {
    coolOffHours: props.coolOffHours,
    baseVoteDays: props.baseVoteDays,
  };

  const newAdvancedSettings = {
    depositExemptProposalCount: props.depositExemptProposalCount,
    minInstructionHoldupDays: props.minInstructionHoldupDays,
  };

  const votingDurationDiff = diff(currentVotingDuration, newVotingDuration);
  const communityDetailsDiff = diff(
    props.initialCommunityRules,
    props.communityRules,
  );
  const councilDetailsDiff = diff(
    (props.initialCouncilRules || {}) as NonNullable<CouncilRules>,
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
            {!!votingDurationDiff.baseVoteDays?.length && (
              <SummaryItem
                label="Unrestricted Voting Time"
                value={
                  <div className="flex items-baseline">
                    {votingDurationDiff.baseVoteDays[1] ? (
                      <div>
                        {unrestrictedVotingTimeText(
                          votingDurationDiff.baseVoteDays[1],
                        )}
                      </div>
                    ) : (
                      <div>Disabled</div>
                    )}
                    {votingDurationDiff.baseVoteDays[0] ? (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {unrestrictedVotingTimeText(
                          votingDurationDiff.baseVoteDays[0],
                        )}
                      </div>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                }
              />
            )}
            {!!votingDurationDiff.coolOffHours?.length && (
              <SummaryItem
                label="Cool-Off Voting Time"
                value={
                  <div className="flex items-baseline">
                    {typeof votingDurationDiff.coolOffHours[1] === 'number' ? (
                      <div>
                        {votingDurationDiff.coolOffHours[1]}{' '}
                        {ntext(votingDurationDiff.coolOffHours[1], 'hour')}
                      </div>
                    ) : (
                      <div>Disabled</div>
                    )}
                    {typeof votingDurationDiff.coolOffHours[0] === 'number' ? (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {votingDurationDiff.coolOffHours[0]}{' '}
                        {ntext(votingDurationDiff.coolOffHours[0], 'hour')}
                      </div>
                    ) : (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        Disabled
                      </div>
                    )}
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
            {!!communityDetailsDiff.canCreateProposal?.length && (
              <SummaryItem
                label="Allow community members to create proposals"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {communityDetailsDiff.canCreateProposal[1] ? 'Yes' : 'No'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {communityDetailsDiff.canCreateProposal[0] ? 'Yes' : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.votingPowerToCreateProposals?.length &&
              props.communityRules.canCreateProposal && (
                <SummaryItem
                  label="Minimum amount of community tokens required to create a proposal"
                  value={
                    <div>
                      {communityDetailsDiff.votingPowerToCreateProposals[1] ? (
                        <div>
                          {formatNumber(
                            communityDetailsDiff
                              .votingPowerToCreateProposals[1],
                            undefined,
                            { maximumFractionDigits: 0 },
                          )}{' '}
                          {ntext(
                            communityDetailsDiff.votingPowerToCreateProposals[1].toNumber(),
                            'token',
                          )}
                        </div>
                      ) : (
                        <div>Disabled</div>
                      )}
                      {!props.initialCommunityRules.canCreateProposal ||
                      !communityDetailsDiff.votingPowerToCreateProposals[0] ? (
                        <div className="text-base text-neutral-500 line-through">
                          Disabled
                        </div>
                      ) : (
                        <div className="text-base text-neutral-500 line-through">
                          {formatNumber(
                            communityDetailsDiff
                              .votingPowerToCreateProposals[0],
                            undefined,
                            { maximumFractionDigits: 0 },
                          )}{' '}
                          {ntext(
                            communityDetailsDiff.votingPowerToCreateProposals[0].toNumber(),
                            'token',
                          )}
                        </div>
                      )}
                    </div>
                  }
                />
              )}
            {!!communityDetailsDiff.canVote?.length && (
              <SummaryItem
                label="Community Members Can Vote?"
                value={
                  <div className="flex items-baseline">
                    <div>{communityDetailsDiff.canVote[1] ? 'Yes' : 'No'}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {communityDetailsDiff.canVote[0] ? 'Yes' : 'No'}
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
                    {communityDetailsDiff.quorumPercent[1] ? (
                      <div>{communityDetailsDiff.quorumPercent[1]}%</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                    {communityDetailsDiff.quorumPercent[0] ? (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {communityDetailsDiff.quorumPercent[0]}%
                      </div>
                    ) : (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        Disabled
                      </div>
                    )}
                  </div>
                }
              />
            )}
            {!!communityDetailsDiff.voteTipping?.length && (
              <SummaryItem
                label="Community Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    {communityDetailsDiff.voteTipping[1] ? (
                      <div>{getLabel(communityDetailsDiff.voteTipping[1])}</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                    {communityDetailsDiff.voteTipping[0] ? (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {getLabel(communityDetailsDiff.voteTipping[0])}
                      </div>
                    ) : (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        Disabled
                      </div>
                    )}
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
            {!!councilDetailsDiff.canCreateProposal && (
              <SummaryItem
                label="Allow council members to create proposals"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {councilDetailsDiff.canCreateProposal[1] ? 'Yes' : 'No'}
                    </div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {councilDetailsDiff.canCreateProposal[0] ? 'Yes' : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.votingPowerToCreateProposals?.length &&
              props.councilRules?.canCreateProposal && (
                <SummaryItem
                  label="Minimum amount of council tokens required to create a proposal"
                  value={
                    <div>
                      {councilDetailsDiff.votingPowerToCreateProposals[1] ? (
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
                      ) : (
                        <div>Disabled</div>
                      )}
                      {!props.initialCouncilRules?.canCreateProposal ||
                      !councilDetailsDiff.votingPowerToCreateProposals[0] ? (
                        <div className="text-base text-neutral-500 line-through">
                          Disabled
                        </div>
                      ) : (
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
                      )}
                    </div>
                  }
                />
              )}
            {!!councilDetailsDiff.canVote?.length && (
              <SummaryItem
                label="Council Members Can Vote?"
                value={
                  <div className="flex items-baseline">
                    <div>{councilDetailsDiff.canVote[1] ? 'Yes' : 'No'}</div>
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {councilDetailsDiff.canVote[0] ? 'Yes' : 'No'}
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
                    {councilDetailsDiff.quorumPercent[1] ? (
                      <div>{councilDetailsDiff.quorumPercent[1]}%</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                    {councilDetailsDiff.quorumPercent[0] ? (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {councilDetailsDiff.quorumPercent[0]}%
                      </div>
                    ) : (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        Disabled
                      </div>
                    )}
                  </div>
                }
              />
            )}
            {!!councilDetailsDiff.voteTipping?.length && (
              <SummaryItem
                label="Council Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    {councilDetailsDiff.voteTipping[1] ? (
                      <div>{getLabel(councilDetailsDiff.voteTipping[1])}</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                    {councilDetailsDiff.voteTipping[0] ? (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        {getLabel(councilDetailsDiff.voteTipping[0])}
                      </div>
                    ) : (
                      <div className="ml-3 text-base text-neutral-500 line-through">
                        Disabled
                      </div>
                    )}
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
        <div className="space-y-8">
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
                  {advancedSettingsDiff.minInstructionHoldupDays[1] ? (
                    <div>
                      {advancedSettingsDiff.minInstructionHoldupDays[1]}{' '}
                      {ntext(
                        advancedSettingsDiff.minInstructionHoldupDays[1],
                        'day',
                      )}
                    </div>
                  ) : (
                    <div>Disabled</div>
                  )}
                  {advancedSettingsDiff.minInstructionHoldupDays[0] ? (
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      {advancedSettingsDiff.minInstructionHoldupDays[0]}{' '}
                      {ntext(
                        advancedSettingsDiff.minInstructionHoldupDays[0],
                        'day',
                      )}
                    </div>
                  ) : (
                    <div className="ml-3 text-base text-neutral-500 line-through">
                      Disabled
                    </div>
                  )}
                </div>
              }
            />
          )}
        </div>
      )}
    </SectionBlock>
  );
}
