import { pickDefaultBg } from '@hub/components/AuthorAvatar';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  iconUrl?: string | null;
  name: string;
}

export function RealmIcon(props: Props) {
  if (props.iconUrl) {
    return (
      <img
        className={cx(
          'rounded-full',
          'border',
          'border-neutral-400',
          props.className,
        )}
        src={props.iconUrl}
      />
    );
  } else {
    const bgColor = pickDefaultBg(props.name);
    const text = props.name.slice(0, 2);

    return (
      <div
        className={cx(
          bgColor,
          'flex',
          'items-center',
          'justify-center',
          'rounded-full',
          'text-white',
          'tracking-tighter',
          props.className,
        )}
      >
        {text}
      </div>
    );
  }
}
