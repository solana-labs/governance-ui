import TimeIcon from '@carbon/icons-react/lib/Time'

import { SectionBlock } from '@components/core/SectionBlock'
import { SectionHeader } from '@components/core/SectionHeader'
// import { SliderValue } from '../SliderValue';
// import { SummaryItem } from '../SummaryItem'
import { ValueBlock } from '@components/core/ValueBlock'
import { Input } from '@components/core/controls/Input'
import TextareaProps from '@components/core/controls/TextArea'
import { useState } from 'react'
// import { Slider } from '@hub/components/controls/Slider'
// import { formatNumber } from '@hub/lib/formatNumber'
// import { ntext } from '@hub/lib/ntext'
// import { FormProps } from '@hub/types/FormProps'

interface Props {
  className?: string
  //   programVersion: number
}

export function ProposalTitle(props: Props) {
  const [description, setDescription] = useState('')
  //   const unrestrictedVotingHours = 24 * props.maxVoteDays - props.coolOffHours
  //   const unrestrictedVotingDays = Math.floor(unrestrictedVotingHours / 24)
  //   const unrestrictedVotingRemainingHours =
  // unrestrictedVotingHours - unrestrictedVotingDays * 24

  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<TimeIcon />}
        text="Title and Description"
      />
      <ValueBlock className="mb-8" title="Proposal Title" description="">
        <Input
          className="w-full pr-24"
          placeholder="eg. Send USDC to wallet address"
          //   value={props.choice}
          onChange={(e) => {
            console.log('Value typing is: ', e.currentTarget.value)
            // props.setChoice(props.index, e.currentTarget.value)
          }}
        />
      </ValueBlock>
      <ValueBlock
        title="Proposal Description"
        description="This will help voters understand more details about your proposed changes."
      >
        {/* ToDO Adi: CHANGE THIS TO HAVE SAME DESIGN CONSISTENCY */}
        <TextareaProps
          className="mb-3"
          placeholder="Description of your proposal or use a github gist link (optional)"
          value={description}
          onChange={
            (evt) => setDescription(evt.target.value)
            // handleSetForm({
            //   value: evt.target.value,
            //   propertyName: 'description',
            // })
          }
        ></TextareaProps>
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
  )
}
