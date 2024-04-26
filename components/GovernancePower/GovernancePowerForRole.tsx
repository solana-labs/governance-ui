import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useAsync } from 'react-async-hook'
import { determineVotingPowerType } from '@hooks/queries/governancePower'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import VanillaVotingPower from './Power/Vanilla/VanillaVotingPower'
import { Deposit } from './Power/Vanilla/Deposit'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import { PluginName } from '@constants/plugins'
import { VotingPowerCards } from '@components/GovernancePower/Power/VotingPowerCards'

type VotingPowerDisplayType = PluginName | 'composite'

export default function GovernancePowerForRole({
  role,
  ...props
}: {
  role: 'community' | 'council'
  hideIfZero?: boolean
  className?: string
}) {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()
  const { plugins } = useRealmVoterWeightPlugins(role)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { result: kind } = useAsync<
    VotingPowerDisplayType | undefined
  >(async () => {
    if (realmPk === undefined) return undefined
    // if there are multiple plugins, show the generic plugin voting power
    if ((plugins?.voterWeight.length ?? 0) > 1) return 'composite'
    return determineVotingPowerType(connection, realmPk, role)
  }, [connection, plugins?.voterWeight.length, realmPk, role])

  if (connected && kind === undefined && !props.hideIfZero) {
    return (
      <div className="animate-pulse bg-bkg-1 col-span-1 h-[76px] rounded-lg" />
    )
  }
  return (
    <>
      {role === 'community' ? (
        <VotingPowerCards role={role} {...props} />
      ) : // council
      kind === 'vanilla' ? (
        <div>
          <VanillaVotingPower role="council" {...props} />
          <Deposit role="council" />
        </div>
      ) : null}
    </>
  )
}
