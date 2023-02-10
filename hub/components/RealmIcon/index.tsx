import { pickDefaultBg } from '@hub/components/AuthorAvatar';
import ecosystemIcon from '@hub/components/EcosystemHeader/icon.png';
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
          'dark:border-neutral-600',
          props.className,
        )}
        src={props.iconUrl}
      />
    );
  } else if (props.name.toLocaleLowerCase() === 'ecosystem hub') {
    return (
      <img
        className={cx(
          'rounded-full',
          'border',
          'border-neutral-400',
          'dark:border-neutral-600',
          props.className,
        )}
        src={ecosystemIcon.src}
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
