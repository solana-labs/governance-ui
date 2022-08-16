import * as Tabs from '@radix-ui/react-tabs'
import React, { forwardRef } from 'react'
import cx from 'classnames'

interface Props {
  className?: string
  children: React.ReactNode
  value: string
}

const Inner = forwardRef<HTMLButtonElement, Props>(
  (props: Props & { 'data-state'?: 'active' | 'inactive' }, ref) => {
    return (
      <button
        {...props}
        className={cx(
          'flex',
          'h-10',
          'items-center',
          'justify-center',
          'relative',
          'text-sm',
          'transition-colors',
          'w-32',
          props.className,
          props['data-state'] === 'active'
            ? 'text-primary-light'
            : 'text-white/50'
        )}
        ref={ref}
      >
        {props.children}
        <div
          className={cx(
            'absolute',
            'bg-gradient-to-r',
            'bottom-0',
            'from-[#00C2FF]',
            'h-[2px]',
            'left-0',
            'right-0',
            'to-[#87F2FF]',
            'transition-opacity',
            'via-[#00E4FF]',
            props['data-state'] === 'active' ? 'opacity-100' : 'opacity-0'
          )}
        />
      </button>
    )
  }
)

export default function Tab(props: Props) {
  return (
    <Tabs.Trigger value={props.value} asChild>
      <Inner {...props} />
    </Tabs.Trigger>
  )
}
