import { SectionBlock } from '@components/core/SectionBlock'
import { SectionHeader } from '@components/core/SectionHeader'
import { ValueBlock } from '@components/core/ValueBlock'
import { SummaryItem } from '../SummaryItem'
import cx from '@hub/lib/cx'
import Idea from '@carbon/icons-react/lib/Idea'
import { useContext } from 'react'
import { NewMultiPropContext, NewMultiPropType } from '../../../new'

interface Props {
  className?: string
  //   programVersion: number
}

export function VotingOptions(props: Props) {
  const { multiOptions } = useContext(NewMultiPropContext) as NewMultiPropType

  console.log('Test value is: ', multiOptions)

  return (
    <SectionBlock className={cx(props.className, 'mt-8')}>
      <SectionHeader icon={<Idea />} text="Voting Options" />
      <ValueBlock title="" description="">
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 mt-10 pb-4">
          {multiOptions.map((option, idx) => {
            return (
              <SummaryItem
                key={idx}
                label={`Option ${idx + 1}`}
                value={option}
              />
            )
          })}
        </div>
      </ValueBlock>
    </SectionBlock>
  )
}
