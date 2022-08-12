import React from 'react'
import cx from 'classnames'
import type { PublicKey } from '@solana/web3.js'
import { DocumentDuplicateIcon } from '@heroicons/react/outline'

import Tooltip from '@components/Tooltip'
import { abbreviateAddress } from '@utils/formatting'
import { notify } from '@utils/notifications'

interface Props {
  address: PublicKey | string
  className?: string
}

export default function Address(props: Props) {
  const base58 =
    typeof props.address === 'string' ? props.address : props.address.toBase58()
  const text = abbreviateAddress(base58)

  return (
    <div className={cx(props.className, 'flex space-x-2 text-white/50')}>
      <a
        className="cursor-pointer transition-colors hover:text-fgd-1 hover:underline"
        href={`https://explorer.solana.com/address/${base58}`}
        target="_blank"
        rel="noreferrer"
      >
        {text}
      </a>
      <button
        className="h-[1.25em] w-[1.25em] transition-colors hover:text-fgd-1"
        onClick={async () => {
          try {
            await navigator?.clipboard?.writeText(base58)
          } catch {
            notify({
              type: 'error',
              message: 'Could not copy address to clipboard',
            })
          }
        }}
      >
        <Tooltip content="Copy Address">
          <DocumentDuplicateIcon className="cursor-pointer h-[1.25em] w-[1.25em]" />
        </Tooltip>
      </button>
    </div>
  )
}
