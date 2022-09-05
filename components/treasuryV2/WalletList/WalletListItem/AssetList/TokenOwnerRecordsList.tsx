import { UserGroupIcon } from '@heroicons/react/solid'
import { TokenOwnerRecordAsset } from '@models/treasury/Asset'
import Collapsible from './Collapsible'
import TokenOwnerRecordListItem from './TokenOwnerRecordListItem'

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
  return (
    <Collapsible
      className={props.className}
      count={props.assets.length}
      disableCollapse={props.disableCollapse}
      expanded={props.expanded}
      icon={<UserGroupIcon className="stroke-white/50" />}
      title="DAO Memberships"
      onToggleExpand={props.onToggleExpand}
    >
      {props.assets.map((a) => (
        <TokenOwnerRecordListItem
          key={a.address.toBase58()}
          onSelect={() => props.onSelect?.(a)}
          name={a.realmSymbol}
          thumbnail={
            a.realmImage ? (
              <img
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
