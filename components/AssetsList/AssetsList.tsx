import AssetItem from './AssetItem'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernanceAccountType } from '@solana/spl-governance'

interface AssetsListProps {
  panelView?: boolean
}

const AssetsList = ({ panelView }: AssetsListProps) => {
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const programGovernances = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])
  return !panelView ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-flow-row gap-4">
      {programGovernances.map((x) => (
        <AssetItem key={x.pubkey.toBase58()} item={x} />
      ))}
    </div>
  ) : (
    <div className="space-y-3">
      {programGovernances.map((x) => (
        <AssetItem key={x.pubkey.toBase58()} item={x} panelView />
      ))}
    </div>
  )
}
export default AssetsList
