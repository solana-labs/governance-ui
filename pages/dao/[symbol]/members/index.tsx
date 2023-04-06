import useRealm from '@hooks/useRealm'
import Members from './Members'
const MembersPage = () => {
  const { config } = useRealm()
  return (
    <div>
      {!config?.account.communityTokenConfig.voterWeightAddin ? (
        <Members />
      ) : null}
    </div>
  )
}

export default MembersPage
