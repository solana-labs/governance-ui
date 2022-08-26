import React from 'react'
import cx from 'classnames'

interface Props {
  className?: string
  address: string
  icon: JSX.Element
  name: string
}

export default function Title(props: Props) {
  return (
    <div className={props.className}>
      <div className="flex items-center space-x-2">
        {React.cloneElement(props.icon, {
          className: cx(
            props.icon.props.className,
            'stroke-fgd-1',
            'h-5',
            'w-5'
          ),
        })}
        <div className="text-fgd-1 text-xl font-bold">{props.name}</div>
      </div>
    </div>
  )
}
