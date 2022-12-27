import React from 'react'
import cx from 'classnames'

import type { BigNumber } from 'bignumber.js'
import { formatNumber } from '@utils/formatNumber'

import { GlobeIcon } from '@heroicons/react/outline'

import ListItem from './ListItem'

interface Props {
  className?: string
  count: BigNumber
  selected?: boolean
  onSelect?(): void
}

export default function DomainListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name="Domains"
      rhs={
        <div
          className={cx(
            'bg-bkg-1',
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
      thumbnail={<GlobeIcon className="stroke-fgd-1 h-6 w-6" />}
      onSelect={props.onSelect}
    />
  )
}
