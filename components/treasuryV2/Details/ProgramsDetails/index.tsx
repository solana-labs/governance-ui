import React from 'react'
import cx from 'classnames'

import { Programs } from '@models/treasury/Asset'

import Header from './Header'
import Info from './Info'
import StickyScrolledContainer from '../StickyScrolledContainer'

interface Props {
  className?: string
  programs: Programs
  isStickied?: boolean
}

export default function ProgramsDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header programs={props.programs} />
        <section className="p-6 bg-bkg-3">
          <Info programs={props.programs} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
