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
  return (
    <SectionBlock className={cx('space-y-16', props.className)}>
      {!!Object.keys(props).length && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<TimeIcon />}
            text="Voting Duration"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {!!props.baseVoteDays?.length && (
              <SummaryItem
                label="Unrestricted Voting Time"
                value={
                  <div className="flex items-baseline">
                    {props.baseVoteDays ? (
                      <div>
                        {unrestrictedVotingTimeText(props.baseVoteDays)}
                      </div>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                }
              />
            )}
            {!!props.coolOffHours?.length && (
              <SummaryItem
                label="Cool-Off Voting Time"
                value={
                  <div className="flex items-baseline">
                    {typeof props.coolOffHours === 'number' ? (
                      <div>
                        {props.coolOffHours} {ntext(props.coolOffHours, 'hour')}
                      </div>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}
      {!!Object.keys(props.communityRules).length && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<UserMultipleIcon />}
            text="Community Details"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {!!props.communityRules.canCreateProposal?.length && (
              <SummaryItem
                label="Allow community members to create proposals"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {props.communityRules.canCreateProposal ? 'Yes' : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {!!props.communityRules.votingPowerToCreateProposals?.length &&
              props.communityRules.canCreateProposal && (
                <SummaryItem
                  label="Minimum amount of community tokens required to create a proposal"
                  value={
                    <div>
                      {props.communityRules.votingPowerToCreateProposals ? (
                        <div>
                          {formatNumber(
                            props.communityRules.votingPowerToCreateProposals,
                            undefined,
                            { maximumFractionDigits: 0 },
                          )}{' '}
                          {ntext(
                            props.communityRules.votingPowerToCreateProposals.toNumber(),
                            'token',
                          )}
                        </div>
                      ) : (
                        <div>Disabled</div>
                      )}
                    </div>
                  }
                />
              )}
            {!!props.communityRules.canVote?.length && (
              <SummaryItem
                label="Community Members Can Vote?"
                value={
                  <div className="flex items-baseline">
                    <div>{props.communityRules.canVote ? 'Yes' : 'No'}</div>
                  </div>
                }
              />
            )}
            {!!props.communityRules.quorumPercent?.length && (
              <SummaryItem
                label="Community Voting Quorum"
                value={
                  <div className="flex items-baseline">
                    {props.communityRules.quorumPercent ? (
                      <div>{props.communityRules.quorumPercent}%</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                }
              />
            )}
            {!!props.communityRules.voteTipping?.length && (
              <SummaryItem
                label="Community Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    {props.communityRules.voteTipping ? (
                      <div>{getLabel(props.communityRules.voteTipping)}</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                }
              />
            )}
            {!!props.communityRules.canVeto?.length && (
              <SummaryItem
                label="Community Veto Power over Council Proposals?"
                value={
                  <div className="flex items-baseline">
                    <div>{props.communityRules.canVeto ? 'Yes' : 'No'}</div>
                  </div>
                }
              />
            )}
            {props.communityRules.canVeto &&
              !!props.communityRules.vetoQuorumPercent?.length && (
                <SummaryItem
                  label="Community Veto Voting Quorum"
                  value={
                    <div className="flex items-baseline">
                      <div>{props.communityRules.vetoQuorumPercent || 0}%</div>
                    </div>
                  }
                />
              )}
          </div>
        </div>
      )}
      {!!Object.keys(props.councilRules).length && (
        <div>
          <SectionHeader
            className="mb-8"
            icon={<BuildingIcon />}
            text="Council Details"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {!!props.councilRules.canCreateProposal && (
              <SummaryItem
                label="Allow council members to create proposals"
                value={
                  <div className="flex items-baseline">
                    <div>
                      {props.councilRules.canCreateProposal ? 'Yes' : 'No'}
                    </div>
                  </div>
                }
              />
            )}
            {!!props.councilRules.votingPowerToCreateProposals?.length &&
              props.councilRules?.canCreateProposal && (
                <SummaryItem
                  label="Minimum amount of council tokens required to create a proposal"
                  value={
                    <div>
                      {props.councilRules.votingPowerToCreateProposals ? (
                        <div>
                          {formatNumber(
                            props.councilRules.votingPowerToCreateProposals,
                            undefined,
                            { maximumFractionDigits: 0 },
                          )}{' '}
                          {ntext(
                            props.councilRules.votingPowerToCreateProposals.toNumber(),
                            'token',
                          )}
                        </div>
                      ) : (
                        <div>Disabled</div>
                      )}
                    </div>
                  }
                />
              )}
            {!!props.councilRules.canVote?.length && (
              <SummaryItem
                label="Council Members Can Vote?"
                value={
                  <div className="flex items-baseline">
                    <div>{props.councilRules.canVote ? 'Yes' : 'No'}</div>
                  </div>
                }
              />
            )}
            {!!props.councilRules.quorumPercent?.length && (
              <SummaryItem
                label="Council Voting Quorum"
                value={
                  <div className="flex items-baseline">
                    {props.councilRules.quorumPercent ? (
                      <div>{props.councilRules.quorumPercent}%</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                }
              />
            )}
            {!!props.councilRules.voteTipping?.length && (
              <SummaryItem
                label="Council Vote Tipping"
                value={
                  <div className="flex items-baseline">
                    {props.councilRules.voteTipping ? (
                      <div>{getLabel(props.councilRules.voteTipping)}</div>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                }
              />
            )}
            {!!props.councilRules.canVeto?.length && (
              <SummaryItem
                label="Council Veto Power over Community Proposals?"
                value={
                  <div className="flex items-baseline">
                    <div>{props.councilRules.canVeto ? 'Yes' : 'No'}</div>
                  </div>
                }
              />
            )}
            {props.councilRules?.canVeto &&
              !!props.councilRules.vetoQuorumPercent?.length && (
                <SummaryItem
                  label="Council Veto Voting Quorum"
                  value={
                    <div className="flex items-baseline">
                      <div>{props.councilRules.vetoQuorumPercent || 0}%</div>
                    </div>
                  }
                />
              )}
          </div>
        </div>
      )}
      {!!Object.keys(props).length && (
        <div className="space-y-8">
          <SectionHeader
            className="mb-8"
            icon={<ChemistryIcon />}
            text="Advanced Options"
          />
          {!!props.depositExemptProposalCount?.length && (
            <SummaryItem
              label="The amount of proposals a member can create without a deposit."
              value={
                <div className="flex items-baseline">
                  <div>{props.depositExemptProposalCount}</div>
                </div>
              }
            />
          )}
          {!!props.minInstructionHoldupDays?.length && (
            <SummaryItem
              label="Minimum Instruction Holdup Time"
              value={
                <div className="flex items-baseline">
                  {props.minInstructionHoldupDays ? (
                    <div>
                      {props.minInstructionHoldupDays}{' '}
                      {ntext(props.minInstructionHoldupDays, 'day')}
                    </div>
                  ) : (
                    <div>Disabled</div>
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
