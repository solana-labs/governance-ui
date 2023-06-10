import RadioButtonIcon from '@carbon/icons-react/lib/RadioButton'
import RadioButtonCheckedIcon from '@carbon/icons-react/lib/RadioButtonChecked'

import * as Button from '@components/core/controls/Button'
import cx from '@hub/lib/cx'

interface Props {
  className?: string
  value: boolean
  valueFalseText: string
  valueTrueText: string
  disableValueTrue?: boolean
  disableValueFalse?: boolean
  onChange?(value: boolean): void
}

export function ButtonToggle(props: Props) {
  return (
    <div className={cx(props.className, 'grid', 'grid-cols-2', 'gap-x-2.5')}>
      {props.value === true ? (
        <Button.PrimaryAlt
          className="h-full"
          disabled={props.disableValueTrue}
          onClick={() => props.onChange?.(true)}
        >
          <RadioButtonCheckedIcon className="h-4 mr-1 w-4" />
          {props.valueTrueText}
        </Button.PrimaryAlt>
      ) : (
        <Button.SecondaryAlt
          className="h-full opacity-60"
          disabled={props.disableValueTrue}
          onClick={() => props.onChange?.(true)}
        >
          <RadioButtonIcon className="h-4 mr-1 w-4" />
          {props.valueTrueText}
        </Button.SecondaryAlt>
      )}
      {props.value === false ? (
        <Button.PrimaryAlt
          className="h-full"
          disabled={props.disableValueFalse}
          onClick={() => props.onChange?.(false)}
        >
          <RadioButtonCheckedIcon className="h-4 mr-1 w-4" />
          {props.valueFalseText}
        </Button.PrimaryAlt>
      ) : (
        <Button.SecondaryAlt
          className="h-full opacity-60"
          disabled={props.disableValueFalse}
          onClick={() => props.onChange?.(false)}
        >
          <RadioButtonIcon className="h-4 mr-1 w-4" />
          {props.valueFalseText}
        </Button.SecondaryAlt>
      )}
    </div>
  )
}

ButtonToggle.defaultProps = {
  valueFalseText: 'No',
  valueTrueText: 'Yes',
}
