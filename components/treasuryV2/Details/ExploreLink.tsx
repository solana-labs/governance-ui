import { ExternalLinkIcon } from '@heroicons/react/outline'
import React from 'react'
import cx from 'classnames'

import Tooltip from '@components/Tooltip'

interface Props {
  className?: string
  address?: string
}

export default function ExploreLink(props: Props) {
  return (
    <Tooltip content={props.address ? undefined : 'Nothing selected'}>
      <a
        className={cx(
          'flex',
          'items-center',
          'space-x-1',
          'text-primary-light',
          props.address ? 'cursor-pointer' : 'cursor-not-allowed',
          !props.address && 'opacity-60'
        )}
        href={
          props.address
            ? `https://explorer.solana.com/address/${props.address}`
            : 'https://explorer.solana.com'
        }
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLinkIcon className="h-4 w-4" />
        <div className="text-sm">Explorer</div>
      </a>
    </Tooltip>
  )
}

export const ExploreButton = (props: {
  address: string
  className?: string
}) => {
  return (
    <a
      className={cx('flex', 'items-center', 'cursor-pointer')}
      href={`https://explorer.solana.com/address/${props.address}`} //todo solscan? devnet?
      target="_blank"
      rel="noreferrer"
    >
      <ExternalLinkIcon className="h-4 w-4" />
    </a>
  )
}
