import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  realmIconUrl?: null | string;
  realmName: string;
}

export function RealmHeader(props: Props) {
  return (
    <div className={cx('flex', 'items-center', 'space-x-2', props.className)}>
      <div
        className={cx(
          'bg-black',
          'flex',
          'h-8',
          'items-center',
          'px-3',
          'rounded',
          'space-x-2',
        )}
      >
        {props.realmIconUrl && (
          <img className="rounded-full h-4 w-4" src={props.realmIconUrl} />
        )}
        <div className="text-white">{props.realmName}</div>
      </div>
    </div>
  );
}
