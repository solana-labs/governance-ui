import React from 'react'

import ListItem from './ListItem'
import { CurrencyDollarIcon } from '@heroicons/react/solid'
import { formatNumber } from '@utils/formatNumber'
import BigNumber from 'bignumber.js'

interface Props {
  className?: string
  selected?: boolean
  amount: BigNumber
  onSelect?(): void
}

export default function MangoListItem(props: Props) {
  return (
    <ListItem
      className={props.className}
      name={`Mango Accounts Treasury`}
      rhs={
        <div className="flex items-end flex-col">
          <div className="flex items-center space-x-1">
            <div className="text-xs text-fgd-1">$</div>
            <div className="text-xs text-fgd-1 font-bold">
              {formatNumber(props.amount)}
            </div>
          </div>
        </div>
      }
      selected={props.selected}
      onSelect={props.onSelect}
      thumbnail={<CurrencyDollarIcon className="stroke-fgd-1 h-6 w-6" />}
    />
  )
}
