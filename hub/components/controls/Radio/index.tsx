import RadioButtonIcon from '@carbon/icons-react/lib/RadioButton';
import RadioButtonCheckedIcon from '@carbon/icons-react/lib/RadioButtonChecked';
import * as RadioGroup from '@radix-ui/react-radio-group';

import cx from '@hub/lib/cx';

export function Item(props: RadioGroup.RadioGroupItemProps) {
  const { children, className, ...rest } = props;

  return (
    <RadioGroup.Item
      className={cx(
        'cursor-pointer',
        'flex',
        'group',
        'items-center',
        'outline-none',
        'space-x-4',
        'tracking-normal',
        className,
      )}
      {...rest}
    >
      {props.checked ? (
        <RadioGroup.Indicator>
          <RadioButtonCheckedIcon className="h-4 w-4 fill-sky-500" />
        </RadioGroup.Indicator>
      ) : (
        <RadioButtonIcon
          className={cx(
            'fill-neutral-500',
            'h-4',
            'w-4',
            'group-hover:fill-neutral-900',
          )}
        />
      )}
      {children && <div className="flex items-center">{children}</div>}
    </RadioGroup.Item>
  );
}

export const Root = RadioGroup.Root;
