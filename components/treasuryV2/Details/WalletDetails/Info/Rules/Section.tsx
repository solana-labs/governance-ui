import React from 'react'
import cx from 'classnames'

interface Props {
  className?: string
  icon: JSX.Element
  name: string
  value: string
}

export default function Section(props: Props) {
  return (
    <div className={props.className}>
      <div className="flex items-center space-x-1 mb-1">
        {React.cloneElement(props.icon, {
          className: cx(
            props.icon.props.className,
            'h-4',
            'w-4',
            'stroke-white/50'
          ),
        })}
        <div className="text-white/50 text-sm">{props.name}</div>
      </div>
      <div
        className={cx(props.className, 'text-fgd-1', 'text-xl', 'font-bold')}
      >
        {props.value}
      </div>
    </div>
  )
}
