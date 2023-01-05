import * as SliderRoot from '@radix-ui/react-slider';

import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  trackColor?: string;
  max: number;
  min: number;
  step: number;
  value: number;
  onRenderValue(value: number): React.ReactNode;
  onChange?(value: number): void;
}

export function Slider(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'gap-x-1.5',
        'grid-cols-[max-content,1fr,max-content]',
        'grid',
        'h-14',
        'items-center',
        'p-4',
        'rounded-md',
        'w-full',
        'dark:bg-neutral-800',
      )}
    >
      <div className="text-center min-w-[32px] dark:text-neutral-300">
        {props.onRenderValue(props.min)}
      </div>
      <SliderRoot.Root
        max={props.max}
        min={props.min}
        step={props.step}
        value={[props.value]}
        onValueChange={(values) => props.onChange?.(values[0])}
        onValueCommit={(values) => props.onChange?.(values[0])}
      >
        <SliderRoot.Track className="block h-2 relative rounded-sm dark:bg-black">
          <SliderRoot.Range
            className={cx(
              'absolute',
              'block',
              'h-2',
              'rounded-sm',
              'bg-neutral-300',
              props.trackColor,
            )}
          />
          <SliderRoot.Thumb
            className={cx(
              '-translate-y-1/2',
              'block',
              'cursor-pointer',
              'h-6',
              'mt-1',
              'rounded-full',
              'transition-colors',
              'w-6',
              'dark:bg-white',
              'dark:hover:bg-neutral-300',
            )}
          />
        </SliderRoot.Track>
      </SliderRoot.Root>
      <div className="text-center min-w-[32px] dark:text-neutral-300">
        {props.onRenderValue(props.max)}
      </div>
    </div>
  );
}

Slider.defaultProps = {
  step: 1,
  onRenderValue: (value) => String(value),
} as Props;
