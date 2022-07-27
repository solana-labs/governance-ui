import React, { useState } from 'react'
import cx from 'classnames'
import {
  ChevronDownIcon,
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'

interface Props {
  className?: string
  children?: JSX.Element[]
  count: number
  defaultOpen: boolean
  disableCollapse?: boolean
  icon: JSX.Element
  title: string
}

export default function Collapsible(props: Props) {
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(props.defaultOpen)

  const children = expanded ? props.children : props.children?.slice(0, 3)

  return (
    <div className={cx(props.className)}>
      <button
        className={cx(
          'flex',
          'items-center',
          'justify-between',
          'w-full',
          'px-3',
          !props.disableCollapse ? 'cursor-pointer' : 'cursor-default'
        )}
        disabled={props.disableCollapse}
        onClick={(e) => {
          if (!props.disableCollapse) {
            e.stopPropagation()
            setOpen((current) => !current)
          }
        }}
      >
        <div className="flex items-center">
          {React.cloneElement(props.icon, {
            className: cx(props.icon.props.className, 'h-3', 'w-3'),
          })}
          <div className="text-white/50 text-xs ml-1">{props.title}</div>
          <div
            className={cx(
              'bg-white/10',
              'flex',
              'h-4',
              'items-center',
              'justify-center',
              'ml-2',
              'rounded-full',
              'text-[10px]',
              'text-white/50',
              'min-w-[16px]',
              'px-1'
            )}
          >
            {props.count}
          </div>
        </div>
        {!props.disableCollapse && (
          <ChevronDownIcon
            className={cx(
              'h-4',
              'text-white/50',
              'transition-all',
              'w-4',
              open ? '' : '-rotate-90'
            )}
          />
        )}
      </button>
      {open && children && (
        <div className="space-y-1 mt-3">
          {children.map((child, i) =>
            React.cloneElement(child, { key: child.key || i })
          )}
        </div>
      )}
      {open && props.children && props.children.length > 3 && (
        <div className="flex items-center justify-center mt-2">
          <button
            className="text-white/50 text-sm flex items-center space-x-1"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? (
              <ArrowCircleUpIcon className="h-4 w-4" />
            ) : (
              <ArrowCircleDownIcon className="h-4 w-4" />
            )}
            <span>{expanded ? 'View fewer' : 'View all'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

Collapsible.defaultProps = {
  defaultOpen: true,
}
