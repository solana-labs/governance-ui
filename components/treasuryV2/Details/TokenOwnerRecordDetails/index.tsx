import cx from 'classnames'
import StickyScrolledContainer from '../StickyScrolledContainer'
import Header from './Header'
import RealmDetails from './RealmDetails'
import { useMemo } from 'react'
import { PublicKey } from '@metaplex-foundation/js'

interface Props {
  className?: string
  governance: string
  tokenOwnerRecord: string
  isStickied?: boolean
}
export default function TokenOwnerRecordDetails(props: Props) {
  const governancePk = useMemo(() => new PublicKey(props.governance), [
    props.governance,
  ])
  const torPk = useMemo(() => new PublicKey(props.tokenOwnerRecord), [
    props.tokenOwnerRecord,
  ])

  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header tokenOwnerRecord={torPk} governance={governancePk} />
        <section className="p-6 bg-bkg-3">
          <RealmDetails governance={governancePk} tokenOwnerRecord={torPk} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
