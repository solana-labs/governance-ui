import React from 'react'
import cx from 'classnames'

import { RealmAuthority } from '@models/treasury/Asset'

import Config from './Config'
import Header from './Header'
import StickyScrolledContainer from '../StickyScrolledContainer'

interface Props {
  className?: string
  realmAuthority: RealmAuthority
  isStickied?: boolean
}

export default function RealmAuthorityDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header realmAuthority={props.realmAuthority} />
        <section className="p-6 bg-bkg-3">
          <Config realmAuthority={props.realmAuthority} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
