import TimeIcon from '@carbon/icons-react/lib/Time';

import { SectionBlock } from '../SectionBlock';
import { SectionHeader } from '../SectionHeader';
import { SliderValue } from '../SliderValue';
import { SummaryItem } from '../SummaryItem';
import { ValueBlock } from '../ValueBlock';
import { Slider } from '@hub/components/controls/Slider';
import { formatNumber } from '@hub/lib/formatNumber';
import { ntext } from '@hub/lib/ntext';
import { FormProps } from '@hub/types/FormProps';

interface Props
  extends FormProps<{
    coolOffHours: number;
    maxVoteDays: number;
  }> {
  className?: string;
  programVersion: number;
}

export function VotingDuration(props: Props) {
  const unrestrictedVotingHours = 24 * props.maxVoteDays - props.coolOffHours;
  const unrestrictedVotingDays = Math.floor(unrestrictedVotingHours / 24);
  const unrestrictedVotingRemainingHours =
    unrestrictedVotingHours - unrestrictedVotingDays * 24;

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<TimeIcon />}
        text="Voting Duration"
      />
      <ValueBlock
        description="The lifespan of your proposal, start to finish. This includes unrestricted and cool-off voting times."
        title="Total Voting Duration"
      >
        <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
          <SliderValue
            min={1}
            max={7}
            value={props.maxVoteDays}
            units={ntext(props.maxVoteDays, 'Day')}
            onChange={props.onMaxVoteDaysChange}
          />
          <Slider
            min={1}
            max={7}
            value={props.maxVoteDays}
            onChange={props.onMaxVoteDaysChange}
          />
        </div>
      </ValueBlock>
      {props.programVersion >= 3 && (
        <ValueBlock
          className="mt-8"
          description={
            <>
              After an unrestricted voting time, cool-off voting time limits
              members to voting <span className="font-bold">No</span>,
              withdrawing their vote, or vetoing a proposal. A member cannot
              vote to approve a proposal during the cool-off time.
            </>
          }
          title="Cool-Off Voting Time"
        >
          <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
            <SliderValue
              min={0}
              max={24}
              value={props.coolOffHours}
              units={ntext(props.coolOffHours, 'Hour')}
              onChange={props.onCoolOffHoursChange}
            />
            <Slider
              min={0}
              max={24}
              trackColor="bg-orange-400"
              value={props.coolOffHours}
              onChange={props.onCoolOffHoursChange}
            />
          </div>
          <div className="flex items-center mt-3 text-xs">
            <div className="dark:text-neutral-500">
              Unrestricted Voting Time:
            </div>
            <div className="ml-2 dark:text-neutral-50">
              <span className="font-bold">
                {formatNumber(unrestrictedVotingDays, undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>{' '}
              {ntext(unrestrictedVotingDays, 'day')}
            </div>
            {!!unrestrictedVotingRemainingHours && (
              <div className="ml-2 dark:text-neutral-50">
                <span className="font-bold">
                  {formatNumber(unrestrictedVotingRemainingHours, undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>{' '}
                {ntext(unrestrictedVotingRemainingHours, 'hour')}
              </div>
            )}
          </div>
        </ValueBlock>
      )}
      {props.programVersion >= 3 && (
        <div className="mt-12">
          <div className="font-bold text-neutral-500">Summary</div>
          <div className="grid grid-cols-3 gap-x-4 mt-4 pb-4">
            <SummaryItem
              label="Unrestricted Voting Time"
              value={
                <div className="flex items-center">
                  <div>
                    {formatNumber(unrestrictedVotingDays, undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {ntext(unrestrictedVotingDays, 'day')}
                  </div>
                  {!!unrestrictedVotingRemainingHours && (
                    <div className="ml-3">
                      {formatNumber(
                        unrestrictedVotingRemainingHours,
                        undefined,
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        },
                      )}{' '}
                      {ntext(unrestrictedVotingRemainingHours, 'hour')}
                    </div>
                  )}
                </div>
              }
            />
            <SummaryItem
              label="Cool-Off Voting Time"
              value={`${formatNumber(props.coolOffHours, undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })} ${ntext(props.coolOffHours, 'hour')}`}
            />
            <SummaryItem
              label="Total Voting Duration"
              value={`${formatNumber(props.maxVoteDays, undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })} ${ntext(props.maxVoteDays, 'day')}`}
            />
          </div>
        </div>
      )}
    </SectionBlock>
  );
}
