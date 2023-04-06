import * as NavigationMenu from '@radix-ui/react-navigation-menu';

import cx from '@hub/lib/cx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function DropdownButton(props: Props) {
  return (
    <NavigationMenu.Item>
      <button
        {...props}
        className={cx(
          props.className,
          'fill-neutral-700',
          'gap-x-2',
          'grid-cols-[16px,1fr]',
          'grid',
          'h-10',
          'items-center',
          'px-3',
          'text-left',
          'text-neutral-700',
          'text-sm',
          'transition-all',
          'w-full',
          'active:bg-neutral-300',
          'hover:bg-neutral-200',
          'dark:fill-neutral-400',
          'dark:text-neutral-400',
          'dark:active:bg-neutral-600',
          'dark:hover:bg-neutral-700',
          'dark:hover:text-neutral-200',
          'dark:hover:fill-neutral-200',
        )}
      />
    </NavigationMenu.Item>
  );
}
