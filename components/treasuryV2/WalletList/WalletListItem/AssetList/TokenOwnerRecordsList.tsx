import { UserGroupIcon } from '@heroicons/react/solid'
import { TokenOwnerRecordAsset } from '@models/treasury/Asset'
import { BN_ZERO } from '@solana/spl-governance'
import { useMemo } from 'react'
import Collapsible from './Collapsible'
import TokenOwnerRecordListItem from './TokenOwnerRecordListItem'
import OutsideSrcImg from '@components/OutsideSrcImg'

interface Props {
  className?: string
  disableCollapse?: boolean
  expanded?: boolean
  assets: TokenOwnerRecordAsset[]
  selectedAssetId?: string | null
  onSelect?(asset: TokenOwnerRecordAsset): void
  onToggleExpand?(): void
}
export default function TokenOwnerRecordsList(props: Props) {
  const validTokenOwnerRecords = useMemo(() => {
    return props.assets.filter((a) =>
      a.tokenOwnerRecordAccount.account.governingTokenDepositAmount.gt(BN_ZERO)
    )
  }, [props.assets])

  if (!validTokenOwnerRecords.length) return null

  return (
    <Collapsible
      className={props.className}
      count={validTokenOwnerRecords.length}
      disableCollapse={props.disableCollapse}
      expanded={props.expanded}
      icon={<UserGroupIcon className="stroke-white/50" />}
      title="DAO Memberships"
      onToggleExpand={props.onToggleExpand}
    >
      {validTokenOwnerRecords.map((a) => (
        <TokenOwnerRecordListItem
          key={a.address.toBase58()}
          onSelect={() => props.onSelect?.(a)}
          name={a.realmSymbol}
          thumbnail={
            a.realmImage ? (
              <OutsideSrcImg
                src={a.realmImage}
                alt={a.realmSymbol}
                className="h-6 w-auto"
              />
            ) : (
              <UserGroupIcon className="h-6 w-6" />
            )
          }
        />
      ))}
    </Collapsible>
  )
}
