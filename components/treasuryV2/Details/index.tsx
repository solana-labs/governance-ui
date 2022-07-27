import React, { forwardRef } from 'react'
import cx from 'classnames'

import { Asset, AssetType } from '@models/treasury/Asset'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import { Result, Status } from '@utils/uiTypes/Result'

import AuxiliaryWalletDetails from './AuxiliaryWalletDetails'
import ExploreLink from './ExploreLink'
import MintDetails from './MintDetails'
import NFTCollectionDetails from './NFTCollectionDetails'
import NoWalletSelected from './NoWalletSelected'
import ProgramsDetails from './ProgramsDetails'
import TokenDetails from './TokenDetails'
import WalletDetails from './WalletDetails'

function assetAddress(asset: Asset) {
  switch (asset.type) {
    case AssetType.Mint:
      return asset.address
    case AssetType.NFTCollection:
      return asset.address || asset.list[0].address || asset.id
    case AssetType.Programs:
      return asset.list[0].address
    case AssetType.Sol:
      return asset.address
    case AssetType.Token:
      return asset.address
    case AssetType.Unknown:
      return asset.address
  }
}

function walletIsNotAuxiliary(
  wallet: AuxiliaryWallet | Wallet
): wallet is Wallet {
  return 'address' in wallet
}

interface Props {
  className?: string
  data: Result<{
    asset?: Asset | null
    wallet?: AuxiliaryWallet | Wallet | null
  }>
  isStickied?: boolean
}

const Details = forwardRef<HTMLDivElement, Props>((props, ref) => {
  switch (props.data.status) {
    case Status.Failed:
      return (
        <div className={props.className} ref={ref}>
          <div className="flex-shrink-0 flex items-center justify-end pb-5">
            <div className="w-40 bg-bkg-1 rounded-sm text-lg opacity-50">
              &nbsp;
            </div>
          </div>
          <div className="h-52 rounded bg-bkg-1 opacity-50" />
        </div>
      )
    case Status.Pending:
      return (
        <div className={props.className} ref={ref}>
          <div className="flex-shrink-0 flex items-center justify-end pb-5">
            <div className="w-40 bg-bkg-1 rounded-sm text-lg animate-pulse">
              &nbsp;
            </div>
          </div>
          <div className="h-52 rounded bg-bkg-1 animate-pulse" />
        </div>
      )
    default:
      return (
        <div
          className={cx(
            props.className,
            'grid grid-rows-[28px_1fr] gap-y-5 max-h-screen overflow-y-auto'
          )}
          ref={ref}
        >
          {props.data.data.wallet && props.data.data.asset ? (
            <>
              <div className="flex-shrink-0 flex items-center justify-end">
                <div className="h-7 flex items-center">
                  <ExploreLink
                    address={assetAddress(props.data.data.asset)}
                    className="transition-opacity"
                  />
                </div>
              </div>
              {props.data.data.asset.type === AssetType.Sol ||
              props.data.data.asset.type === AssetType.Token ? (
                <TokenDetails
                  asset={props.data.data.asset}
                  isStickied={props.isStickied}
                  governanceAddress={
                    'governanceAddress' in props.data.data.wallet
                      ? props.data.data.wallet.governanceAddress
                      : undefined
                  }
                />
              ) : props.data.data.asset.type === AssetType.Mint ? (
                <MintDetails
                  mint={props.data.data.asset}
                  isStickied={props.isStickied}
                />
              ) : props.data.data.asset.type === AssetType.Programs ? (
                <ProgramsDetails
                  programs={props.data.data.asset}
                  isStickied={props.isStickied}
                />
              ) : props.data.data.asset.type === AssetType.NFTCollection ? (
                <NFTCollectionDetails
                  nftCollection={props.data.data.asset}
                  isStickied={props.isStickied}
                />
              ) : (
                <div />
              )}
            </>
          ) : props.data.data.wallet ? (
            <>
              <div className="flex-shrink-0 flex items-center justify-end">
                <div className="h-7 flex items-center">
                  <ExploreLink
                    address={
                      'address' in props.data.data.wallet
                        ? props.data.data.wallet.address
                        : ''
                    }
                    className="transition-opacity"
                  />
                </div>
              </div>
              {walletIsNotAuxiliary(props.data.data.wallet) ? (
                <WalletDetails
                  isStickied={props.isStickied}
                  wallet={props.data.data.wallet}
                />
              ) : (
                <AuxiliaryWalletDetails
                  isStickied={props.isStickied}
                  wallet={props.data.data.wallet}
                />
              )}
            </>
          ) : (
            <>
              <div className="flex-shrink-0 flex items-center justify-end">
                <div className="h-7 flex items-center">
                  <ExploreLink />
                </div>
              </div>
              <NoWalletSelected />
            </>
          )}
        </div>
      )
  }
})

export default Details
