import React from 'react'
import cx from 'classnames'

import ListItem from './ListItem'
import { DesktopComputerIcon } from '@heroicons/react/solid'

interface Props {
  className?: string
  selected?: boolean
  publicKey: string | undefined
  onSelect?(): void
}

export default function StakeListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name="Stake Account"
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
            'w-24'
          )}
        >
          <small>{props.publicKey}</small>
        </div>
      }
      selected={props.selected}
      thumbnail={<DesktopComputerIcon className="stroke-fgd-1 h-6 w-6" />}
      onSelect={props.onSelect}
    />
  )
}
