import cx from '@hub/lib/cx'

interface Props {
  className?: string
  text: React.ReactNode
  style?: string
}

export function ValueDescription(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'text-sm',
        props.style === 'light'
          ? 'dark:text-neutral-300'
          : 'dark:text-neutral-500'
      )}
    >
      {props.text}
    </div>
  )
}
