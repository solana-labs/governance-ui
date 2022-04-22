import useRealm from '@hooks/useRealm'
import LockTokenStats from 'VoteStakeRegistry/components/LockTokenStats/LockTokensPage'
import Members from './Members'
import { vsrPluginsPks } from '@hooks/useVotingPlugins'
const MembersPage = () => {
  const { realm, symbol, config } = useRealm()
  const isLockTokensMode =
    config?.account.communityVoterWeightAddin &&
    vsrPluginsPks.includes(
      config?.account.communityVoterWeightAddin?.toBase58()
    )
  return (
    <div>
      {!realm?.account.config.useCommunityVoterWeightAddin && (
        <Members></Members>
      )}
      {isLockTokensMode && symbol === 'MNGO' && (
        <LockTokenStats></LockTokenStats>
      )}
    </div>
  )
}

export default MembersPage
