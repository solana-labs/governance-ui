import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ChevronDownIcon from '@carbon/icons-react/lib/ChevronDown';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useEffect, useRef, useState } from 'react';

import cx from '@hub/lib/cx';
import { GovernanceVoteTipping } from '@hub/types/GovernanceVoteTipping';

export function getLabel(value: GovernanceVoteTipping): string {
  switch (value) {
    case GovernanceVoteTipping.Disabled:
      return 'Disabled';
    case GovernanceVoteTipping.Early:
      return 'Early';
    case GovernanceVoteTipping.Strict:
      return 'Strict';
  }
}

function getDescription(value: GovernanceVoteTipping): string {
  switch (value) {
    case GovernanceVoteTipping.Disabled:
      return 'A proposal passes only when the total voting duration elapses';
    case GovernanceVoteTipping.Early:
      return 'A proposal passes when quorum is reached';
    case GovernanceVoteTipping.Strict:
      return 'A proposal passes when it cannot mathematically be defeated';
  }
}

const itemStyles = cx(
  'border',
  'cursor-pointer',
  'gap-x-4',
  'grid-cols-[80px,1fr,20px]',
  'grid',
  'h-14',
  'items-center',
  'px-4',
  'rounded-md',
  'text-left',
  'transition-colors',
  'dark:bg-neutral-800',
  'dark:border-neutral-700',
  'dark:hover:bg-neutral-700',
);

const labelStyles = cx('font-700', 'dark:text-neutral-50');
const descriptionStyles = cx('dark:text-neutral-400');
const iconStyles = cx('fill-neutral-500', 'h-5', 'transition-transform', 'w-4');

interface Props {
  className?: string;
  value: GovernanceVoteTipping;
  onChange?(value: GovernanceVoteTipping): void;
}

export function VoteTippingSelector(props: Props) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (trigger.current) {
      setWidth(trigger.current.clientWidth);
    } else {
      setWidth(0);
    }
  }, [trigger, open]);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <div>
        <DropdownMenu.Trigger
          className={cx(itemStyles, props.className)}
          ref={trigger}
        >
          <div className={labelStyles}>{getLabel(props.value)}</div>
          <div className={descriptionStyles}>{getDescription(props.value)}</div>
          <ChevronDownIcon className={cx(iconStyles, open && '-rotate-180')} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="space-y-0.5"
            sideOffset={2}
            style={{ width }}
          >
            {[
              GovernanceVoteTipping.Disabled,
              GovernanceVoteTipping.Early,
              GovernanceVoteTipping.Strict,
            ]
              .filter((voteTippingType) => voteTippingType !== props.value)
              .map((voteTippingType) => (
                <DropdownMenu.Item
                  className={cx(
                    itemStyles,
                    'w-full',
                    'focus:outline-none',
                    'dark:focus:bg-neutral-700',
                  )}
                  key={voteTippingType}
                  onClick={() => props.onChange?.(voteTippingType)}
                >
                  <div className={labelStyles}>{getLabel(voteTippingType)}</div>
                  <div className={descriptionStyles}>
                    {getDescription(voteTippingType)}
                  </div>
                  {voteTippingType === props.value && (
                    <CheckmarkIcon className={iconStyles} />
                  )}
                </DropdownMenu.Item>
              ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </div>
    </DropdownMenu.Root>
  );
}
