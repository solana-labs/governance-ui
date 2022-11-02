import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  iconUrl?: null | string;
  name: string;
}

export function Divider(props: Props) {
  return (
    <div
      className={cx(
        'gap-x-4',
        'grid',
        'grid-cols-[1fr,max-content,1fr]',
        'items-center',
        props.className,
      )}
    >
      <div className="space-y-1">
        <div className="h-[1px] w-full bg-neutral-300" />
        <div className="h-[1px] w-full bg-neutral-300" />
      </div>
      <div>
        {props.iconUrl ? (
          <img src={props.iconUrl} className="h-6 rounded-full w-6" />
        ) : (
          <div className="h-6 rounded-full w-6 flex items-center justify-center bg-black">
            <div className="text-base text-neutral-100">
              {props.name.slice(0, 1)}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="h-[1px] w-full bg-neutral-300" />
        <div className="h-[1px] w-full bg-neutral-300" />
      </div>
    </div>
  );
}
