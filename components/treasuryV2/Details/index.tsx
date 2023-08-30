import { forwardRef } from 'react'
import cx from 'classnames'

import { Asset, AssetType } from '@models/treasury/Asset'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import { Result, Status } from '@utils/uiTypes/Result'

import AuxiliaryWalletDetails from './AuxiliaryWalletDetails'
import MintDetails from './MintDetails'
import NFTCollectionDetails from './NFTCollectionDetails'
import NoWalletSelected from './NoWalletSelected'
import ProgramsDetails from './ProgramsDetails'
import RealmAuthorityDetails from './RealmAuthorityDetails'
import TokenDetails from './TokenDetails'
import WalletDetails from './WalletDetails'
import DomainsDetails from './DomainsDetails'
import TokenOwnerRecordDetails from './TokenOwnerRecordDetails'
import StakeDetails from './StakeDetails'
import { useTreasurySelectState } from './treasurySelectStore'

function walletIsNotAuxiliary(
  wallet: AuxiliaryWallet | Wallet
): wallet is Wallet {
  return 'address' in wallet
}

interface Props {
  className?: string
  data: Result<{
    asset?: Asset | null | 'USE NON-LEGACY STATE'
    wallet?: AuxiliaryWallet | Wallet | null | 'USE NON-LEGACY STATE'
  }>
  isStickied?: boolean
}

const Details = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const [treasurySelect] = useTreasurySelectState()

  switch (props.data._tag) {
    case Status.Failed:
      return (
        <div className={props.className} ref={ref}>
          <div className="h-52 rounded bg-bkg-1 opacity-50" />
        </div>
      )
    case Status.Pending:
      return (
        <div className={props.className} ref={ref}>
          <div className="h-52 rounded bg-bkg-1 animate-pulse" />
        </div>
      )
    default:
      return (
        <div
          className={cx(
            props.className,
            'grid grid-rows-[1fr] gap-y-5 max-h-screen overflow-y-auto'
          )}
          ref={ref}
        >
          {props.data.data.wallet === 'USE NON-LEGACY STATE' ||
          props.data.data.asset === 'USE NON-LEGACY STATE' ? (
            treasurySelect?._kind === 'NftCollection' ? (
              <NFTCollectionDetails
                governance={treasurySelect.selectedGovernance}
                collectionId={treasurySelect.collectionId}
                isStickied={props.isStickied}
              />
            ) : treasurySelect?._kind === 'TokenOwnerRecord' ? (
              <TokenOwnerRecordDetails
                isStickied={props.isStickied}
                governance={treasurySelect.selectedGovernance}
                tokenOwnerRecord={treasurySelect.pubkey}
              />
            ) : (
              (null as never)
            )
          ) : props.data.data.wallet && props.data.data.asset ? (
            <>
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
                  wallet={
                    walletIsNotAuxiliary(props.data.data.wallet)
                      ? props.data.data.wallet
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
              ) : props.data.data.asset.type === AssetType.RealmAuthority ? (
                <RealmAuthorityDetails
                  realmAuthority={props.data.data.asset}
                  isStickied={props.isStickied}
                />
              ) : props.data.data.asset.type === AssetType.Domain ? (
                <DomainsDetails
                  domains={props.data.data.asset}
                  isStickied={props.isStickied}
                />
              ) : props.data.data.asset.type === AssetType.Stake ? (
                <StakeDetails
                  isStickied={props.isStickied}
                  account={props.data.data.asset}
                ></StakeDetails>
              ) : (
                <div />
              )}
            </>
          ) : props.data.data.wallet ? (
            <>
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
              <NoWalletSelected />
            </>
          )}
        </div>
      )
  }
})

export default Details
