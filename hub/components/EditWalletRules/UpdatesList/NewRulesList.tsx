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
import { DISABLED_VALUE } from '@tools/constants';
import { capitalize } from '@hub/lib/capitalize';

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
  depositExemptProposalCount: number;
  baseVoteDays: number;
  minInstructionHoldupDays: number;
}

export function NewRulesList(props: Props) {
  return (
    <SectionBlock className={cx('space-y-16', props.className)}>
      <div>
        <SectionHeader
          className="mb-8"
          icon={<TimeIcon />}
          text="Voting Duration"
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          <SummaryItem
            label="Unrestricted Voting Time"
            value={
              <div className="flex items-baseline">
                {props.baseVoteDays ? (
                  <div>{unrestrictedVotingTimeText(props.baseVoteDays)}</div>
                ) : (
                  <div>Disabled</div>
                )}
              </div>
            }
          />

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
        </div>
      </div>

      <GovPopRules govPop="community" rules={props.communityRules} />

      {props.councilRules !== null && (
        <GovPopRules govPop="council" rules={props.councilRules} />
      )}
      <div className="space-y-8">
        <SectionHeader
          className="mb-8"
          icon={<ChemistryIcon />}
          text="Advanced Options"
        />

        <SummaryItem
          label="The amount of proposals a member can create without a deposit."
          value={
            <div className="flex items-baseline">
              <div>{props.depositExemptProposalCount}</div>
            </div>
          }
        />

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
      </div>
    </SectionBlock>
  );
}

const GovPopRules = ({
  rules,
  govPop,
}: {
  rules: NonNullable<CouncilRules> | CommunityRules;
  govPop: 'community' | 'council';
}) => {
  return (
    <div>
      <SectionHeader
        className="mb-8"
        icon={govPop === 'community' ? <UserMultipleIcon /> : <BuildingIcon />}
        text={`${capitalize(govPop)} Details`}
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
        <SummaryItem
          label={`Allow ${govPop} members to create proposals`}
          value={
            <div className="flex items-baseline">
              <div>{rules.canCreateProposal ? 'Yes' : 'No'}</div>
            </div>
          }
        />
        {rules.canCreateProposal && (
          <SummaryItem
            className="col-start-2"
            label={`Minimum amount of ${govPop} tokens required to create a proposal`}
            value={
              <div>
                <div>
                  {formatNumber(rules.votingPowerToCreateProposals, undefined, {
                    maximumFractionDigits: 0,
                  })}{' '}
                  {ntext(
                    rules.votingPowerToCreateProposals.toNumber(),
                    'token',
                  )}
                </div>
              </div>
            }
          />
        )}
        <SummaryItem
          label={`${capitalize(govPop)} Members Can Vote?`}
          value={
            <div className="flex items-baseline">
              <div>{rules.canVote ? 'Yes' : 'No'}</div>
            </div>
          }
        />
        {rules.canVote && (
          <SummaryItem
            label={`${capitalize(govPop)} Voting Quorum`}
            value={
              <div className="flex items-baseline">
                {<div>{rules.quorumPercent}%</div>}
              </div>
            }
          />
        )}
        <SummaryItem
          label={`${capitalize(govPop)} Veto Power over Community Proposals?`}
          value={
            <div className="flex items-baseline">
              <div>{rules.canVeto ? 'Yes' : 'No'}</div>
            </div>
          }
        />
        {rules.canVeto && (
          <SummaryItem
            label={`${capitalize(govPop)} Veto Voting Quorum`}
            value={
              <div className="flex items-baseline">
                <div>{rules.vetoQuorumPercent || 0}%</div>
              </div>
            }
          />
        )}
        <SummaryItem
          label={`${capitalize(govPop)} Vote Tipping`}
          value={
            <div className="flex items-baseline">
              {rules.voteTipping ? (
                <div>{getLabel(rules.voteTipping)}</div>
              ) : (
                <div>Disabled</div>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
};
