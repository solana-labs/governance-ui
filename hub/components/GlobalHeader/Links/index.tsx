import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { useRouter } from 'next/router';

import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  links: {
    href: string;
    title: string;
  }[];
}

export function Links(props: Props) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div
      className={cx(
        'flex',
        'items-center',
        'space-x-8',
        'flex-shrink',
        'overflow-hidden',
        'h-full',
        props.className,
      )}
    >
      {props.links.map((link, i) => {
        const isSelected = link.href === currentPath;

        return (
          <Link passHref href={link.href} key={i}>
            <NavigationMenu.Link
              className={cx(
                'block',
                'group',
                'py-2',
                'text-neutral-500',
                'text-sm',
                'relative',
                'hover:text-neutral-900',
                isSelected && 'text-sky-500 hover:text-sky-500',
              )}
            >
              <div className={cx('text-sm', 'transition-colors')}>
                {link.title}
              </div>
              <div
                className={cx(
                  'absolute',
                  'bg-sky-500',
                  'bottom-0',
                  'h-[2px]',
                  'left-0',
                  'opacity-0',
                  'right-0',
                  'transition-opacity',
                  isSelected && 'opacity-100',
                )}
              />
            </NavigationMenu.Link>
          </Link>
        );
      })}
    </div>
  );
}
