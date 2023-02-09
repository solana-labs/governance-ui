import cx from '@hub/lib/cx';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea(props: Props) {
  const { className, ...rest } = props;

  return (
    <textarea
      className={cx(
        'bg-zinc-50',
        'border-zinc-300',
        'border',
        'h-14',
        'py-2',
        'px-3',
        'outline-none',
        'rounded-md',
        'text-neutral-900',
        'transition-colors',
        'hover:border-zinc-400',
        'focus:border-sky-500',
        'placeholder:text-neutral-400',
        'dark:bg-neutral-800',
        'dark:border-neutral-700',
        'dark:placeholder:text-neutral-600',
        'dark:text-neutral-50',
        className,
      )}
      {...rest}
    />
  );
}
