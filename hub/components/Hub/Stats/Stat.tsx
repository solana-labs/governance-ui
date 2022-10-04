import React from 'react';

import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  children?: React.ReactNode;
  icon: JSX.Element;
  label: string;
}

export function Stat(props: Props) {
  return (
    <div
      className={cx(
        'h-[86px]',
        'border-l',
        'border-neutral-300',
        'px-4',
        'flex',
        'items-center',
        props.className,
      )}
    >
      <div>
        <div className="text-3xl text-neutral-900 font-medium">
          {props.children}
        </div>
        <div className="flex items-center text-neutral-500 space-x-1 mt-1">
          {React.cloneElement(props.icon, {
            className: cx(
              props.icon.props.className,
              'h-3',
              'w-3',
              'fill-current',
            ),
          })}
          <div className="text-xs">{props.label}</div>
        </div>
      </div>
    </div>
  );
}
