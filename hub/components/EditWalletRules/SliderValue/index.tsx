import { clamp } from 'ramda';

import { Input } from '@hub/components/controls/Input';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  min: number;
  max: number;
  value: number;
  units: React.ReactNode;
  onChange?(value: number): void;
}

export function SliderValue(props: Props) {
  return (
    <div className={cx('relative', props.className)}>
      <Input
        className="block w-full"
        value={props.value}
        onChange={(e) => {
          const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');

          if (!text) {
            props.onChange?.(0);
          } else {
            const parsed = parseInt(text, 10);
            const value = Number.isNaN(parsed) ? props.min : parsed;
            props.onChange?.(clamp(props.min, props.max, value));
          }
        }}
        onBlur={(e) => {
          const text = e.currentTarget.value.replaceAll(/[^\d.-]/g, '');
          const parsed = parseInt(text, 10);
          const value = Number.isNaN(parsed) ? props.min : parsed;
          props.onChange?.(clamp(props.min, props.max, value));
        }}
      />
      <div
        className={cx(
          'absolute',
          'top-1/2',
          'right-4',
          '-translate-y-1/2',
          'text-center',
          'dark:text-neutral-500',
        )}
      >
        {props.units}
      </div>
    </div>
  );
}
