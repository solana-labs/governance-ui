import React from 'react'
import cx from 'classnames'

import Header from './Header'
import Info from './Info'
import StickyScrolledContainer from '../StickyScrolledContainer'
import { Stake } from '@models/treasury/Asset'

interface Props {
  className?: string
  account: Stake
  isStickied?: boolean
}

export default function StakeDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header account={props.account} />
        <section className="p-6 bg-bkg-3">
          <Info account={props.account} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
