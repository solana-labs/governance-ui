import Checkmark from '@carbon/icons-react/lib/Checkmark';
import ChevronDown from '@carbon/icons-react/lib/ChevronDown';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Select from '@radix-ui/react-select';
import { useRouter } from 'next/router';

import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  links: {
    href: string;
    title: string;
  }[];
}

export function LinksDropdown(props: Props) {
  const router = useRouter();
  const currentPath = router.pathname;

  const selected = props.links.find((link) => link.href === currentPath);

  return (
    <Select.Root
      value={selected?.href}
      onValueChange={(value) => {
        router.push(value);
      }}
      key={selected?.href || 'unselected'}
    >
      <NavigationMenu.Item asChild>
        <Select.Trigger
          className={cx(
            'flex',
            'group',
            'h-10',
            'items-center',
            'justify-end',
            'outline-none',
            'px-3',
            'space-x-2',
            'tracking-normal',
            props.className,
          )}
        >
          <div
            className={cx(
              'text-neutral-500',
              'text-sm',
              'transition-colors',
              'group-hover:text-neutral-900',
              'dark:group-hover:text-neutral-200',
            )}
          >
            <Select.Value asChild>
              <div>{selected?.title || 'Go to'}</div>
            </Select.Value>
          </div>
          <Select.Icon>
            <ChevronDown
              className={cx(
                'fill-neutral-500',
                'h-3',
                'transition-colors',
                'w-3',
                'group-hover:fill-neutral-900',
                'dark:group-hover:fill-neutral-200',
              )}
            />
          </Select.Icon>
        </Select.Trigger>
      </NavigationMenu.Item>
      <Select.Portal>
        <Select.Content
          className={cx(
            'dark:bg-neutral-900',
            'bg-white',
            'rounded',
            'overflow-hidden',
            'tracking-normal',
            'z-50',
            'drop-shadow-2xl',
          )}
        >
          <Select.Viewport>
            {props.links.map((link, i) => (
              <Select.Item
                value={link.href}
                className={cx(
                  'cursor-pointer',
                  'flex',
                  'h-10',
                  'items-center',
                  'justify-end',
                  'outline-none',
                  'pl-3',
                  'pr-8',
                  'relative',
                  'text-neutral-900',
                  'hover:bg-neutral-200',
                  'focus:bg-neutral-200',
                  'dark:text-neutral-400',
                  'dark:hover:bg-neutral-700',
                  'dark:focus:bg-neutral-700',
                )}
                key={i}
              >
                <div className="text-sm">
                  <Select.ItemText>{link.title}</Select.ItemText>
                </div>
                <Select.ItemIndicator>
                  <Checkmark className="h-3 w-3 fill-current absolute top-1/2 right-3 -translate-y-1/2" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
