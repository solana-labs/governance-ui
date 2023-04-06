import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import cx from '@hub/lib/cx';

interface Props extends React.ComponentProps<typeof NavigationMenu.Item> {
  href: string;
  children: JSX.Element;
}

export function ExternalLinkIcon(props: Props) {
  const { children, className, href, ...rest } = props;

  return (
    <NavigationMenu.Item
      className={cx(
        'cursor-pointer',
        'h-5',
        'text-neutral-500',
        'w-5',
        'hover:text-sky-500',
        className,
      )}
      {...rest}
    >
      <NavigationMenu.Link
        className="h-5 w-5"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {React.cloneElement(children, {
          className: cx(
            'h-5',
            'w-5',
            'fill-current',
            'transition-colors',
            children.props.className,
          ),
        })}
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}
