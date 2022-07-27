import React from 'react'
import cx from 'classnames'
import { DocumentDuplicateIcon } from '@heroicons/react/outline'

import { abbreviateAddress } from '@utils/formatting'

interface Props {
  className?: string
  address: string
  icon: JSX.Element
  name: string
}

export default function Title(props: Props) {
  return (
    <div className={props.className}>
      <div className="flex items-center space-x-2">
        {React.cloneElement(props.icon, {
          className: cx(
            props.icon.props.className,
            'stroke-fgd-1',
            'h-5',
            'w-5'
          ),
        })}
        <div className="text-fgd-1 text-xl font-bold">{props.name}</div>
      </div>
      {props.address && (
        <button
          className={cx(
            'flex',
            'items-center',
            'mt-2',
            'space-x-1',
            'text-sm',
            'text-white/50',
            'transition-colors',
            'hover:text-fgd-1'
          )}
          onClick={async () => {
            try {
              await navigator?.clipboard?.writeText(props.address)
            } catch {
              console.error('Could not copy address to clipboard')
            }
          }}
        >
          <div>{abbreviateAddress(props.address)}</div>
          <DocumentDuplicateIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
