import React from 'react'
import { Stake as IStake } from '@models/treasury/Asset'
import Stake from './Stake'

interface Props {
  className?: string
  account: IStake
}

export default function Overview(props: Props) {
  return (
    <section className={props.className}>
      <Stake
        className="py-4 border-b border-white/10 mb-6 last:mb-0"
        key={props.account.raw.extensions.stake!.stakeAccount.toBase58()}
        account={props.account}
      />
    </section>
  )
}
