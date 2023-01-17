import { useEffect, useState } from 'react';

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
  const [value, setValue] = useState(String(props.value));

  useEffect(() => {
    setValue(String(props.value));
  }, [props.value]);

  return (
    <div className={cx('relative', props.className)}>
      <Input
        className="block w-full"
        value={value}
        onChange={(e) => {
          setValue(e.currentTarget.value);
        }}
        onBlur={(e) => {
          const text = e.currentTarget.value.replaceAll(
            /.*?(([0-9]*\.)?[0-9]+).*/g,
            '$1',
          );
          const parsed = parseFloat(text);
          const value = Number.isNaN(parsed) ? props.min : parsed;
          props.onChange?.(Math.max(props.min, value));
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
