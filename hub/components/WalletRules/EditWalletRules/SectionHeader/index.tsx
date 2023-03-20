import { cloneElement } from 'react';

import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  icon: JSX.Element;
  text: string;
}

export function SectionHeader(props: Props) {
  return (
    <header
      className={cx(
        props.className,
        'flex',
        'items-center',
        'space-x-2',
        'text-neutral-500',
      )}
    >
      {cloneElement(props.icon, {
        className: cx(props.icon.props.className, 'fill-current', 'h-4', 'w-4'),
      })}
      <div className="text-xl font-medium">{props.text}</div>
    </header>
  );
}
