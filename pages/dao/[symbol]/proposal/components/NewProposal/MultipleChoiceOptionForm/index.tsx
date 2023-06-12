import { LinkButton } from '@components/Button'
import { ValueBlock } from '@components/core/ValueBlock'
import { XIcon } from '@heroicons/react/solid'
import { Input } from '@components/core/controls/Input'
import cx from '@hub/lib/cx'

interface Props {
  className?: string
  index: number
  choice: string
  setChoice: (index: number, choice: string) => void
  removeChoice: (index: number) => void
}

export function MultipleChoiceOptionForm(props: Props) {
  return (
    <section
      className={cx(
        props.className,
        'p-8',
        'pt-5',
        'rounded',
        'dark:bg-neutral-900'
      )}
    >
      <section
        className={cx(props.className, 'rounded', 'dark:bg-neutral-900')}
      >
        <div className="w-full flex justify-between items-center mb-4">
          <div className={cx('text-neutral-500', 'text-2xl')}>
            {`Choice ${props.index + 1}`}
          </div>
          <LinkButton
            className="flex font-bold items-center ml-4 text-fgd-1 text-sm"
            onClick={() => props.removeChoice(props.index)}
          >
            <XIcon className="h-5 mr-1.5 text-red w-5" />
            Remove
          </LinkButton>
        </div>

        <ValueBlock
          description="This is the text voters will see when they vote"
          title="Add a label"
        >
          <Input
            className="w-full pr-24"
            placeholder={`Voting choice ${props.index + 1}`}
            value={props.choice}
            onChange={(e) => {
              props.setChoice(props.index, e.currentTarget.value)
            }}
          />
        </ValueBlock>
      </section>
    </section>
  )
}
