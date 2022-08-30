import React from 'react'
import cx from 'classnames'

import { Token, Sol } from '@models/treasury/Asset'
import { Wallet } from '@models/treasury/Wallet'

import Header from './Header'
import Investments from './Investments'
import Activity from './Activity'
import StickyScrolledContainer from '../StickyScrolledContainer'
//import Auction from './Auction'
//import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'

interface Props {
  asset: Token | Sol
  className?: string
  isStickied?: boolean
  governanceAddress?: string
  wallet?: Wallet
}

export default function TokenDetails(props: Props) {
  {
    /* Do not remove hidden until release */
  }
  //const assetAccounts = useGovernanceAssetsStore((s) => s.assetAccounts)
  //   const isOwnedBySolAccounts = assetAccounts
  //     .filter((x) => x.isSol)
  //     .find(
  //       (x) =>
  //         x.extensions.transferAddress?.toBase58() ===
  //         props.asset.raw.extensions.token?.account.owner.toBase58()
  //     )
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
          {/* Do not remove hidden until release */}
          {/* {props.asset.type === AssetType.Token && isOwnedBySolAccounts && (
            <Auction asset={props.asset} className="mb-10" />
          )} */}
          <Activity assets={[props.asset]} />
        </section>
      </StickyScrolledContainer>
    </div>
  )
}
