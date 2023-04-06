import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import cx from '@hub/lib/cx';

interface Props extends React.ComponentProps<typeof NavigationMenu.Item> {
  href: string;
  icon: JSX.Element;
  label: string;
}

export function ExternalLinkMenuItem(props: Props) {
  const { icon, label, className, href, ...rest } = props;

  return (
    <NavigationMenu.Item
      className={cx(
        'p-2',
        'cursor-pointer',
        'text-neutral-700',
        'hover:bg-neutral-200',
        className,
      )}
      {...rest}
    >
      <NavigationMenu.Link
        className="flex items-center space-x-2"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {React.cloneElement(icon, {
          className: cx('h-4', 'w-4', 'fill-current', icon.props.className),
        })}
        <div className="text-sm">{label}</div>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}
