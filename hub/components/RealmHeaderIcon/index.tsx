import { pickDefaultBg } from '@hub/components/AuthorAvatar';
import { RealmCircle } from '@hub/components/branding/RealmCircle';
import cx from '@hub/lib/cx';

interface BaseProps {
  className?: string;
}

interface Props extends BaseProps {
  iconUrl?: string | null;
  realmName?: string | null;
  isStickied?: boolean;
}

export function Content(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'bg-white',
        'flex',
        'items-center',
        'justify-center',
        'overflow-hidden',
        'rounded-full',
        'h-[124px]',
        'w-[124px]',
        'md:h-44',
        'md:w-44',
      )}
    >
      {props.iconUrl ? (
        <img
          className={cx(
            'bg-neutral-100',
            'rounded-full',
            'transition-opacity',
            'h-28',
            'w-28',
            'md:h-40',
            'md:w-40',
            props.isStickied ? 'opacity-0' : 'opacity-100',
          )}
          src={props.iconUrl}
        />
      ) : (
        <div
          className={cx(
            'h-28',
            'w-28',
            'md:h-40',
            'md:w-40',
            'rounded-full',
            'flex',
            'items-center',
            'justify-center',
            props.realmName ? pickDefaultBg(props.realmName) : 'bg-neutral-100',
          )}
        >
          {props.realmName ? (
            <div className="text-neutral-900 text-[100px] font-bold">
              {props.realmName[0].toLocaleUpperCase()}
            </div>
          ) : (
            <RealmCircle className="h-20 w-20" />
          )}
        </div>
      )}
    </div>
  );
}

export function Loading(props: BaseProps) {
  return (
    <div
      className={cx(
        props.className,
        'bg-white',
        'flex',
        'items-center',
        'justify-center',
        'overflow-hidden',
        'rounded-full',
        'h-[124px]',
        'w-[124px]',
        'md:h-44',
        'md:w-44',
      )}
    >
      <div
        className={cx(
          'h-28',
          'w-28',
          'md:h-40',
          'md:w-40',
          'rounded-full',
          'bg-neutral-200',
          'flex',
          'items-center',
          'justify-center',
          'animate-pulse',
        )}
      />
    </div>
  );
}

export function Error(props: BaseProps) {
  return (
    <div
      className={cx(
        props.className,
        'bg-white',
        'flex',
        'items-center',
        'justify-center',
        'overflow-hidden',
        'rounded-full',
        'h-[124px]',
        'w-[124px]',
        'md:h-44',
        'md:w-44',
      )}
    >
      <div
        className={cx(
          'h-28',
          'w-28',
          'md:h-40',
          'md:w-40',
          'rounded-full',
          'bg-neutral-200',
          'flex',
          'items-center',
          'justify-center',
        )}
      />
    </div>
  );
}
