import AssetItem from './AssetItem'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { GovernanceAccountType } from '@solana/spl-governance'

const AssetsList = () => {
  const { getGovernancesByAccountType } = useGovernanceAssets()
  const programGovernances = getGovernancesByAccountType(
    GovernanceAccountType.ProgramGovernance
  )
  return (
    <div className="space-y-3">
      {programGovernances.map((x) => (
        <AssetItem key={x.pubkey.toBase58()} item={x}></AssetItem>
      ))}
    </div>
  )
}
export default AssetsList
