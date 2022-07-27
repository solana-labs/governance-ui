import React from 'react'
import cx from 'classnames'
import { FolderOpenIcon } from '@heroicons/react/outline'

import { AuxiliaryWallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'

interface Props {
  className?: string
  wallet: AuxiliaryWallet
}

export default function Header(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'bg-black',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'flex',
        'items-center',
        'justify-between'
      )}
    >
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20">
            <FolderOpenIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-white/50 text-sm">{props.wallet.name}</div>
            <div className="text-fgd-1 font-bold text-2xl">
              ${formatNumber(props.wallet.totalValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
