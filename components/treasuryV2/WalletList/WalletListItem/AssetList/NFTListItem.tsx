import React from 'react'
import type { BigNumber } from 'bignumber.js'
import cx from 'classnames'

import { formatNumber } from '@utils/formatNumber'

import ListItem from './ListItem'

interface Props {
  className?: string
  amount: BigNumber
  name: string
  selected?: boolean
  thumbnail: JSX.Element
  onSelect?(): void
}

export default function NFTListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name={props.name}
      rhs={
        <div className="flex items-center space-x-1">
          <div className="text-xs text-fgd-1 font-bold">
            {formatNumber(props.amount, undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-xs text-fgd-1">
            {props.amount.isEqualTo(1) ? 'NFT' : 'NFTs'}
          </div>
        </div>
      }
      selected={props.selected}
      thumbnail={React.cloneElement(props.thumbnail, {
        className: cx(
          props.thumbnail.props.classnames,
          'fill-white/50',
          'h-6',
          'rounded-sm',
          'w-6'
        ),
      })}
      onSelect={props.onSelect}
    />
  )
}
