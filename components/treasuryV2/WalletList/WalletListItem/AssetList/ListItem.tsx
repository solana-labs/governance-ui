import React from 'react'
import cx from 'classnames'

interface Props {
  className?: string
  name: string
  rhs?: React.ReactNode
  thumbnail: JSX.Element
  selected?: boolean
  onSelect?(): void
}

export default function ListItem(props: Props) {
  return (
    <button
      className={cx(
        props.className,
        'gap-x-4',
        'grid',
        'grid-cols-[1fr_max-content]',
        'h-12',
        'items-center',
        'px-3',
        'rounded',
        'transition-colors',
        'w-full',
        props.selected
          ? 'bg-white/30'
          : props.onSelect
          ? 'bg-bkg-2 hover:bg-bkg-3'
          : '',
        props.onSelect ? 'cursor-pointer' : 'cursor-default'
      )}
      onClick={props.onSelect}
    >
      <div className="grid grid-cols-[max-content_1fr] items-center gap-x-2">
        {props.thumbnail}
        <div className="text-fgd-1 text-base text-left whitespace-nowrap text-ellipsis overflow-hidden">
          {props.name}
        </div>
      </div>
      {props.rhs && <div>{props.rhs}</div>}
    </button>
  )
}
