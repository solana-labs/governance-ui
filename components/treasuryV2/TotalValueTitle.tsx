import type { BigNumber } from 'bignumber.js'
import cx from 'classnames'
import React from 'react'

import { Result, Status } from '@utils/uiTypes/Result'
import { formatNumber } from '@utils/formatNumber'

interface Props {
  className?: string
  data: Result<{
    realm: {
      icon?: JSX.Element
      name: string
    }
    value: BigNumber
  }>
}

export default function TotalValueTitle(props: Props) {
  switch (props.data.status) {
    case Status.Failed:
      return (
        <div className={cx(props.className, 'space-y-1')}>
          <div className="w-40 bg-bkg-1 h-5 rounded-sm opacity-50" />
          <div className="w-96 bg-bkg-1 h-[60px] rounded-sm opacity-50" />
        </div>
      )

    case Status.Pending:
      return (
        <div className={cx(props.className, 'space-y-1')}>
          <div className="w-40 bg-bkg-1 h-5 rounded-sm animate-pulse" />
          <div className="w-96 bg-bkg-1 h-[60px] rounded-sm animate-pulse" />
        </div>
      )

    default:
      return (
        <div className={cx(props.className, 'space-y-1')}>
          <div className="flex items-center text-sm">
            {props.data.data.realm.icon &&
              React.cloneElement(props.data.data.realm.icon, {
                className: cx(
                  props.data.data.realm.icon.props.className,
                  'w-4',
                  'h-4'
                ),
              })}
            <span className="ml-1 text-white/50">
              {props.data.data.realm.name} Total Value
            </span>
          </div>
          <div className="text-fgd-1 text-[52px] leading-[60px] font-bold">
            ${formatNumber(props.data.data.value)}
          </div>
        </div>
      )
  }
}
