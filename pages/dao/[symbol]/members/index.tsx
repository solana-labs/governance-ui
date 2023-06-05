import Members from './Members'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
const MembersPage = () => {
  const config = useRealmConfigQuery().data?.result
  return (
    <div>
      {!config?.account.communityTokenConfig.voterWeightAddin ? (
        <Members />
      ) : null}
    </div>
  )
}

export default MembersPage
