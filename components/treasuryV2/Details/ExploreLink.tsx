import { ExternalLinkIcon } from '@heroicons/react/outline'
import React from 'react'
import cx from 'classnames'

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
