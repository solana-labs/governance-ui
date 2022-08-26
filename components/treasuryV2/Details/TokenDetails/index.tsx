import React from 'react'
import cx from 'classnames'

import { Token, Sol } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'

import Header from './Header'
import Investments from './Investments'
import Activity from './Activity'
import StickyScrolledContainer from '../StickyScrolledContainer'

interface Props {
  asset: Token | Sol
  className?: string
  isStickied?: boolean
  governanceAddress?: string
  wallet?: Wallet
}

export default function TokenDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header asset={props.asset} wallet={props.wallet} />
        <section className="p-6 bg-bkg-3">
          {props.governanceAddress && (
            <Investments
              asset={props.asset}
              className="mb-10"
              governanceAddress={props.governanceAddress}
            />
          )}
          <Activity assets={[props.asset]} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
