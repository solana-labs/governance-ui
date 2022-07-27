import React from 'react'
import cx from 'classnames'

import { Mint } from '@models/treasury/Asset'

import Header from './Header'
import StickyScrolledContainer from '../StickyScrolledContainer'
import Activity from '../TokenDetails/Activity'

interface Props {
  className?: string
  mint: Mint
  isStickied?: boolean
}

export default function MintDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header mint={props.mint} />
        <section className="p-6 bg-bkg-3">
          <Activity asset={{ address: props.mint.address }} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
