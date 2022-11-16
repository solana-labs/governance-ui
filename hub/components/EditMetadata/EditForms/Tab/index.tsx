import * as Tabs from '@radix-ui/react-tabs';
import cx from 'classnames';
import { cloneElement, forwardRef } from 'react';

interface Props {
  className?: string;
  text: string;
  icon: JSX.Element;
}

const Inner = forwardRef<HTMLButtonElement, Props>(
  (props: Props & { 'data-state'?: 'active' | 'inactive' }, ref) => {
    const { className, text, icon, ...rest } = props;

    return (
      <button
        {...rest}
        className={cx(
          'flex',
          'h-8',
          'items-center',
          'justify-center',
          'space-x-1',
          'tracking-normal',
          props['data-state'] !== 'active' && 'hover:text-neutral-900',
          className,
          props['data-state'] === 'active' ? 'text-white' : 'text-neutral-400',
          props['data-state'] === 'active' ? 'bg-sky-500' : 'bg-white',
        )}
        ref={ref}
      >
        {cloneElement(icon, {
          className: cx(
            icon.props.className,
            'h-4',
            'w-4',
            'transition-colors',
            'fill-current',
          ),
        })}
        <div className="hidden sm:block text-xs font-medium transition-colors">
          {text}
        </div>
      </button>
    );
  },
);

export const Tab = forwardRef<HTMLButtonElement, Props>(function Tab(
  props,
  ref,
) {
  return (
    <Tabs.Trigger value={props.text} asChild>
      <Inner {...props} ref={ref} />
    </Tabs.Trigger>
  );
});
