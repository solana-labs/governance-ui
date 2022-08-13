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
        'overflow-hidden',
        'px-4',
        'relative',
        'rounded',
        'transition-colors',
        'w-full',
        props.selected
          ? 'bg-bkg-1'
          : props.onSelect
          ? 'bg-bkg-2 hover:bg-bkg-1'
          : '',
        props.onSelect ? 'cursor-pointer' : 'cursor-default'
      )}
      onClick={props.onSelect}
    >
      <div
        className={cx(
          'absolute',
          'bottom-0',
          'left-0',
          'top-0',
          'transition-colors',
          'w-1',
          props.selected &&
            'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
        )}
      />
      <div className="grid grid-cols-[max-content_1fr] items-center gap-x-3">
        {props.thumbnail}
        <div className="text-fgd-1 text-sm text-left whitespace-nowrap text-ellipsis overflow-hidden">
          {props.name}
        </div>
      </div>
      {props.rhs && <div>{props.rhs}</div>}
    </button>
  )
}
