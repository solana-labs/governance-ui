import { NFT_PLUGINS_PKS } from '@constants/plugins'
import Members from './Members'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
const MembersPage = () => {
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const isNftMode =
    (currentPluginPk &&
      NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())) ||
    false
  return (
    <div>
      {!config?.account.communityTokenConfig.voterWeightAddin || isNftMode ? (
        <Members isNftMode={isNftMode} />
      ) : null}
    </div>
  )
}

export default MembersPage
