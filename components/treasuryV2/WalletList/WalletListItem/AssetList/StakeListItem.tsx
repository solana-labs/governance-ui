import React from 'react'

import ListItem from './ListItem'
import { DesktopComputerIcon } from '@heroicons/react/solid'
import { abbreviateAddress } from '@utils/formatting'
import { formatNumber } from '@utils/formatNumber'
import tokenPriceService from '@utils/services/tokenPrice'
import { WSOL_MINT } from '@components/instructions/tools'

interface Props {
  className?: string
  selected?: boolean
  amount: number
  publicKey: string | undefined
  onSelect?(): void
}

export default function StakeListItem(props: Props) {
  const price = tokenPriceService.getUSDTokenPrice(WSOL_MINT)
  return (
    <ListItem
      className={props.className}
      name={`Stake Account - ${abbreviateAddress(props.publicKey!)}`}
      rhs={
        <div className="flex items-end flex-col">
          <div className="flex items-center space-x-1">
            <div className="text-xs text-fgd-1 font-bold">
              {formatNumber(props.amount)}
            </div>
            <div className="text-xs text-fgd-1">SOL</div>
          </div>
          {price && (
            <div className="text-xs text-white/50">
              ${formatNumber(props.amount * price)}
            </div>
          )}
        </div>
      }
      selected={props.selected}
      thumbnail={<DesktopComputerIcon className="stroke-fgd-1 h-6 w-6" />}
      onSelect={props.onSelect}
    />
  )
}
