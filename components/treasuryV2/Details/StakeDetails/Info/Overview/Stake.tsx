import React from 'react'
import cx from 'classnames'
import { Stake as IStake } from '@models/treasury/Asset'
import { StakeState } from '@utils/uiTypes/assets'

interface Props {
  className?: string
  account: IStake
}

export default function Stake(props: Props) {
  return (
    <div
      className={cx(props.className, 'flex', 'items-center', 'justify-between')}
    >
      State: {StakeState[props.account.state]}
    </div>
  )
}
