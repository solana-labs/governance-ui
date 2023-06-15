import RuleDraft from '@carbon/icons-react/lib/RuleDraft'

import { SectionBlock } from '@components/core/SectionBlock'
import { SectionHeader } from '@components/core/SectionHeader'
// import { SliderValue } from '../SliderValue';
// import { SummaryItem } from '../SummaryItem'
import { ValueBlock } from '@components/core/ValueBlock'
import { SummaryItem } from '../SummaryItem'
// import { Slider } from '@hub/components/controls/Slider'
// import { formatNumber } from '@hub/lib/formatNumber'
// import { ntext } from '@hub/lib/ntext'
// import { FormProps } from '@hub/types/FormProps'
import cx from '@hub/lib/cx'

interface Props {
  className?: string
  //   programVersion: number
}

export function ProposalDetails(props: Props) {
  //   const unrestrictedVotingHours = 24 * props.maxVoteDays - props.coolOffHours
  //   const unrestrictedVotingDays = Math.floor(unrestrictedVotingHours / 24)
  //   const unrestrictedVotingRemainingHours =
  // unrestrictedVotingHours - unrestrictedVotingDays * 24

  return (
    <>
      <SectionBlock className={cx(props.className, 'mb-1')}>
        <SectionHeader icon={<RuleDraft />} text="Rules" />
        <ValueBlock title="" description="">
          <SummaryItem
            label="Wallet Address"
            value="GgjTau...WXzr5"
            //   value={`${formatNumber(props.coolOffHours, undefined, {
            //     minimumFractionDigits: 0,
            //     maximumFractionDigits: 2,
            //   })} ${ntext(props.coolOffHours, 'hour')}`}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 mt-10 pb-4">
            <SummaryItem
              label="Vote Type"
              value="Community"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
            <SummaryItem
              label="Approval Quorum"
              value="60%"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
            <SummaryItem
              label="Vote Tipping"
              value="Strict"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
            <SummaryItem
              label="Veto Power"
              value="Council"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
            <SummaryItem
              label="Veto Quorum"
              value="3%"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
            <SummaryItem
              label="Cool-Off Voting Time"
              value="22 hours"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
          </div>
        </ValueBlock>

        {/* {props.programVersion >= 3 && (
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
            <h1>Hello broski</h1>
          
        </ValueBlock>
      )} */}
        {/* {props.programVersion >= 3 && (
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
                        }
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
      )} */}
      </SectionBlock>
      <SectionBlock className={props.className}>
        <SectionHeader className="mb-8" text="" />
        <ValueBlock title="" description="">
          <SummaryItem
            label="Total Voting Duration"
            value="3 days"
            //   value={`${formatNumber(props.coolOffHours, undefined, {
            //     minimumFractionDigits: 0,
            //     maximumFractionDigits: 2,
            //   })} ${ntext(props.coolOffHours, 'hour')}`}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 mt-10 pb-4">
            <SummaryItem
              label="Unrestricted Voting Time"
              value="3 days"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
            <SummaryItem
              label="Cool-Off Voting Time"
              value="12 hours"
              //   value={`${formatNumber(props.coolOffHours, undefined, {
              //     minimumFractionDigits: 0,
              //     maximumFractionDigits: 2,
              //   })} ${ntext(props.coolOffHours, 'hour')}`}
            />
          </div>
        </ValueBlock>
      </SectionBlock>
    </>
  )
}
