import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  numDots: number;
}

export function LoadingDots(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'flex',
        'items-center',
        'justify-center',
        'gap-x-[0.25em]',
      )}
    >
      {Array.from({ length: props.numDots }).map((_, i) => (
        <div
          className={cx(
            'animate-staggered-bounce',
            'bg-current',
            'flex-shrink-0',
            'h-[0.33em]',
            'opacity-60',
            'rounded-full',
            'w-[0.33em]',
          )}
          key={i}
          style={{
            animationDelay: `${i * 200}ms`,
          }}
        />
      ))}
    </div>
  );
}

LoadingDots.defaultProps = {
  numDots: 3,
};
