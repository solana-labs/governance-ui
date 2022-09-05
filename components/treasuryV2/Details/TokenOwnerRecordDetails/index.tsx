import { TokenOwnerRecordAsset } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'
import { tryParseKey } from '@tools/validators/pubkey'
import cx from 'classnames'
import StickyScrolledContainer from '../StickyScrolledContainer'
import Header from './Header'
import RealmDetails from './RealmDetails'

interface Props {
  className?: string
  selectedWallet?: Wallet
  tokenOwnerRecordAsset: TokenOwnerRecordAsset
  isStickied?: boolean
}
export default function TokenOwnerRecordDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header tokenOwnerRecordAsset={props.tokenOwnerRecordAsset} />
        <section className="p-6 bg-bkg-3">
          <RealmDetails
            currentGovernance={props.selectedWallet?.governanceAccount}
            tokenOwnerRecordAsset={props.tokenOwnerRecordAsset}
            realmAccount={props.tokenOwnerRecordAsset.realmAccount}
            programId={tryParseKey(props.tokenOwnerRecordAsset.programId)}
          />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
