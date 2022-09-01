import { UserGroupIcon } from '@heroicons/react/outline'
import { TokenOwnerAsset } from '@models/treasury/Asset'
import Collapsible from './Collapsible'
import TokenOwnerRecordListItem from './TokenOwnerRecordListItem'

interface Props {
  className?: string
  disableCollapse?: boolean
  expanded?: boolean
  assets: TokenOwnerAsset[]
  selectedAssetId?: string | null
  onSelect?(asset: TokenOwnerAsset): void
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
          key={a.address}
          onSelect={() => props.onSelect?.(a)}
          name={a.realmSymbol}
          thumbnail={a.realmIcon}
        />
      ))}
    </Collapsible>
  )
}
