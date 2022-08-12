import React from 'react'
import type { BigNumber } from 'bignumber.js'
import cx from 'classnames'

import { formatNumber } from '@utils/formatNumber'

import UnknownTokenIcon from '../../../icons/UnknownTokenIcon'
import ListItem from './ListItem'

interface Props {
  className?: string
  count: BigNumber
  name: string
  selected?: boolean
  thumbnail?: JSX.Element
  onSelect?(): void
}

export default function UnknownAssetListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name={props.name}
      rhs={
        !props.count.isZero() ? (
          <div
            className={cx(
              'bg-bkg-1',
              'flex',
              'h-6',
              'items-center',
              'justify-center',
              'rounded-full',
              'text-sm',
              'text-fgd-1',
              'w-6'
            )}
          >
            {formatNumber(props.count, undefined, { maximumFractionDigits: 0 })}
          </div>
        ) : (
          <div />
        )
      }
      selected={props.selected}
      thumbnail={
        props.thumbnail ? (
          React.cloneElement(props.thumbnail, {
            className: cx(
              props.thumbnail.props.className,
              'h-6 w-6 stroke-fgd-1'
            ),
          })
        ) : (
          <UnknownTokenIcon className="stroke-fgd-1 h-6 w-6" />
        )
      }
      onSelect={props.onSelect}
    />
  )
}
