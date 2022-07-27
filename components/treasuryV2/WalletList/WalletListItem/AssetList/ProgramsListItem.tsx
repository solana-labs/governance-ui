import React from 'react'
import type { BigNumber } from 'bignumber.js'
import cx from 'classnames'
import { TerminalIcon } from '@heroicons/react/outline'

import { formatNumber } from '@utils/formatNumber'

import ListItem from './ListItem'

interface Props {
  className?: string
  count: BigNumber
  selected?: boolean
  onSelect?(): void
}

export default function ProgramsListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name="Programs"
      rhs={
        <div
          className={cx(
            'bg-black',
            'flex',
            'h-6',
            'items-center',
            'justify-center',
            'rounded-full',
            'text-sm',
            'text-white',
            'w-6'
          )}
        >
          {formatNumber(props.count, undefined, { maximumFractionDigits: 0 })}
        </div>
      }
      selected={props.selected}
      thumbnail={<TerminalIcon className="stroke-fgd-1 h-6 w-6" />}
      onSelect={props.onSelect}
    />
  )
}
