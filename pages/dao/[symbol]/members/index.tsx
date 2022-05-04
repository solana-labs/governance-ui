import useRealm from '@hooks/useRealm'
import Members from './Members'
const MembersPage = () => {
  const { realm } = useRealm()
  return (
    <div>
      {!realm?.account.config.useCommunityVoterWeightAddin ? <Members /> : null}
    </div>
  )
}

export default MembersPage
