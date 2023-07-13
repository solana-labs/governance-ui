import React from 'react'
import cx from 'classnames'

import ListItem from './ListItem'
import { DesktopComputerIcon } from '@heroicons/react/solid'
import { abbreviateAddress } from '@utils/formatting'

interface Props {
  className?: string
  selected?: boolean
  amount: number
  publicKey: string | undefined
  onSelect?(): void
}

export default function StakeListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name={`Stake Account - ${abbreviateAddress(props.publicKey!)}`}
      rhs={
        <div
          className={cx(
            'flex',
            'h-6',

            'justify-center',
            'rounded-full',
            'text-sm',
            'text-white',
            'w-24'
          )}
        >
          {props.amount} SOL
        </div>
      }
      selected={props.selected}
      thumbnail={<DesktopComputerIcon className="stroke-fgd-1 h-6 w-6" />}
      onSelect={props.onSelect}
    />
  )
}
