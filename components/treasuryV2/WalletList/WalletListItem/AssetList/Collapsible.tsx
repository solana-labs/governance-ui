import React, { useState } from 'react'
import cx from 'classnames'
import {
  ChevronDownIcon,
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid'

interface Props {
  className?: string
  children?: JSX.Element[]
  count: number
  defaultOpen: boolean
  disableCollapse?: boolean
  expanded?: boolean
  expandCutoff: number
  icon: JSX.Element
  title: string
  onToggleExpand?(): void
  onToggleHiddenItems?(): void
  itemsToHide?: string[]
  showHiddenItems?: boolean
}

export default function Collapsible(props: Props) {
  const [open, setOpen] = useState(props.defaultOpen)

  const children = props.expanded
    ? props.children
    : props.children?.slice(0, props.expandCutoff)

  return (
    <div className={cx(props.className)}>
      <div className="flex justify-center items-center">
        <button
          className={cx(
            'flex',
            'items-center',
            'justify-between',
            'w-full',
            'px-[18px]',
            props.onToggleHiddenItems ? 'pr-[10px]' : '',
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
              className: cx(props.icon.props.className, 'h-4', 'w-4'),
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
        {props.onToggleHiddenItems && props.itemsToHide?.length !== 0 && (
          <div className="mr-3">
            {props.showHiddenItems ? (
              <EyeIcon
                className="w-3 cursor-pointer text-white/50"
                onClick={props.onToggleHiddenItems}
              ></EyeIcon>
            ) : (
              <EyeOffIcon
                className="w-3 cursor-pointer text-white/50"
                onClick={props.onToggleHiddenItems}
              ></EyeOffIcon>
            )}
          </div>
        )}
      </div>

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
            onClick={props.onToggleExpand}
          >
            {props.expanded ? (
              <ArrowCircleUpIcon className="h-4 w-4" />
            ) : (
              <ArrowCircleDownIcon className="h-4 w-4" />
            )}
            <span>{props.expanded ? 'View fewer' : 'View all'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

Collapsible.defaultProps = {
  defaultOpen: true,
  expandCutoff: 3,
}
