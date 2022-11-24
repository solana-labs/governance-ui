import React from 'react'
import cx from 'classnames'

import { Domains } from '@models/treasury/Asset'

import Header from './Header'
import Info from './Info'
import StickyScrolledContainer from '../StickyScrolledContainer'

interface Props {
  className?: string
  domains: Domains
  isStickied?: boolean
}

export default function DomainsDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header domains={props.domains} />
        <section className="p-6 bg-bkg-3">
          <Info domains={props.domains} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
