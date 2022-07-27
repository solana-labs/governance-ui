import React from 'react'
import type { BigNumber } from 'bignumber.js'
import cx from 'classnames'

import { formatNumber } from '@utils/formatNumber'

import ListItem from './ListItem'

interface Props {
  className?: string
  amount: BigNumber
  name: string
  price?: BigNumber
  selected?: boolean
  symbol: string
  thumbnail: JSX.Element
  onSelect?(): void
}

export default function TokenListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name={props.name}
      rhs={
        <div className="flex items-end flex-col">
          <div className="flex items-center space-x-1">
            <div className="text-xs text-fgd-1 font-bold">
              {props.amount.isLessThan(0)
                ? formatNumber(props.amount, undefined, {})
                : props.amount.isInteger()
                ? formatNumber(props.amount, undefined, {
                    maximumFractionDigits: 0,
                  })
                : formatNumber(props.amount)}
            </div>
            <div className="text-xs text-fgd-1">{props.symbol}</div>
          </div>
          {props.price && (
            <div className="text-xs text-white/50">
              ${formatNumber(props.amount.multipliedBy(props.price))}
            </div>
          )}
        </div>
      }
      selected={props.selected}
      thumbnail={React.cloneElement(props.thumbnail, {
        className: cx(
          props.thumbnail.props.className,
          'h-6',
          'rounded-sm',
          'stroke-fgd-1',
          'w-6'
        ),
      })}
      onSelect={props.onSelect}
    />
  )
}
