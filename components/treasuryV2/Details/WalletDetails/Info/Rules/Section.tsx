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
      <div className="grid items-start grid-cols-[max-content,1fr] gap-x-1 mb-1">
        {React.cloneElement(props.icon, {
          className: cx(
            props.icon.props.className,
            'h-3',
            'mt-[1.5px]',
            'w-3',
            'stroke-white/50'
          ),
        })}
        <div className="text-white/50 text-xs">{props.name}</div>
      </div>
      <div
        className={cx(props.className, 'text-fgd-1', 'text-sm', 'font-bold')}
      >
        {props.value}
      </div>
    </div>
  )
}
