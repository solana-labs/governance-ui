import ListDropdownIcon from '@carbon/icons-react/lib/ListDropdown';

import cx from '@hub/lib/cx';

interface Props {
  className?: string;
}

export function EndOfFeed(props: Props) {
  return (
    <div
      className={cx(
        'flex-col',
        'flex',
        'items-center',
        'justify-center',
        props.className,
      )}
    >
      <ListDropdownIcon className="h-8 w-8 fill-neutral-900 mb-2" />
      <div className="text-sm text-neutral-500">
        You've reached the end of the feed
      </div>
    </div>
  );
}
