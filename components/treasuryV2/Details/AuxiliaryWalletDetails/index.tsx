import React from 'react'
import cx from 'classnames'

import { AuxiliaryWallet } from '@models/treasury/Wallet'
import { formatNumber } from '@utils/formatNumber'

import Header from './Header'
import StickyScrolledContainer from '../StickyScrolledContainer'

interface Props {
  className?: string
  wallet: AuxiliaryWallet
  isStickied?: boolean
}

export default function WalletDetails(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <StickyScrolledContainer
        className="h-full"
        isAncestorStickied={props.isStickied}
      >
        <Header wallet={props.wallet} />
        <section className="p-6 bg-bkg-3">
          <header className="mb-3">
            <div className="text-fgd-1 text-lg font-bold">Auxiliary Assets</div>
          </header>
          <div className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-4 items-center">
            <div className="text-white/50 text-sm flex items-center">
              Asset Count
            </div>
            <div className="text-fgd-1 text-sm flex items-center">
              {formatNumber(props.wallet.assets.length, undefined, {})}
            </div>
          </div>
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
