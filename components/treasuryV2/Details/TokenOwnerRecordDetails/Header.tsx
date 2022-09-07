import cx from 'classnames'
import { TokenOwnerRecordAsset } from '@models/treasury/Asset'
import { UserGroupIcon } from '@heroicons/react/solid'
import { fmtMintAmount } from '@tools/sdk/units'
import { BN } from '@project-serum/anchor'

interface Props {
  className?: string
  tokenOwnerRecordAsset: TokenOwnerRecordAsset
}
export default function Header(props: Props) {
  const asset = props.tokenOwnerRecordAsset

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'flex',
        'items-center',
        'justify-between'
      )}
    >
      <div className="flex space-x-3 items-center">
        <div>
          {asset.realmImage ? (
            <img
              src={asset.realmImage}
              alt={asset.realmSymbol}
              className="h-12 w-auto"
            />
          ) : (
            <UserGroupIcon className="h-12 w-12 fill-fgd-1" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-fgd-3">
            {asset.address.toBase58().slice(0, 10)}...
          </p>
          <p className="text-2xl font-bold text-fgd-1">{asset.displayName}</p>
          <p className="text-fgd-3">
            Community Votes:{' '}
            {fmtMintAmount(
              asset.communityMint.account,
              new BN(
                asset.tokenOwnerRecordAccount.account.governingTokenDepositAmount.toString()
              )
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
