import AssetItem from './AssetItem'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernanceAccountType } from '@solana/spl-governance'

const AssetsList = () => {
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const programGovernances = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1 ||
      GovernanceAccountType.ProgramGovernanceV2,
  ])
  return (
    <div className="space-y-3">
      {programGovernances.map((x) => (
        <AssetItem key={x.pubkey.toBase58()} item={x}></AssetItem>
      ))}
    </div>
  )
}
export default AssetsList
