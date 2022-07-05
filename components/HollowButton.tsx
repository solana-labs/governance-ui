import classNames from 'classnames'

import Tooltip from './Tooltip'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string
  selected?: boolean
}

export default function HollowButton(props: Props) {
  const { tooltip, className, children, disabled, selected, ...rest } = props

  return (
    <button
      className={classNames(
        className,
        'bg-transparent',
        'border',
        'border-white',
        'cursor-pointer',
        'flex',
        'font-bold',
        'items-center',
        'justify-center',
        'px-2.5',
        'py-2.5',
        'rounded-full',
        'text-sm',
        'transition-colors',
        'active:bg-white/30',
        'hover:bg-white/10',
        disabled && 'opacity-50',
        (disabled || selected) && 'border-black',
        (disabled || selected) && 'cursor-not-allowed',
        (disabled || selected) && 'active:bg-transparent',
        (disabled || selected) && 'hover:bg-transparent'
      )}
      {...rest}
    >
      <Tooltip content={tooltip}>
        <div className={classNames('flex', 'items-center', 'justify-center')}>
          {children}
        </div>
      </Tooltip>
    </button>
  )
}
