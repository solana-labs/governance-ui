import { useVotingPop } from '@components/VotePanel/hooks'
import GovernancePowerForRole from '@components/GovernancePower/GovernancePowerForRole'

export default function VotingPower() {
  const votePop = useVotingPop()
  return votePop === undefined ? (
    <div className="animate-pulse bg-bkg-1 col-span-1 h-[76px] rounded-lg" />
  ) : (
    <GovernancePowerForRole role={votePop} />
  )
}
