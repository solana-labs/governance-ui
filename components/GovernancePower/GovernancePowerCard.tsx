import { GovernancePowerTitle } from '@components/TokenBalance/TokenBalanceCardWrapper'
import { useGovernancePowerAsync } from '@hooks/queries/governancePower'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import GovernancePowerForRole from './GovernancePowerForRole'

const GovernancePowerCard = () => {
  const connected = useWalletOnePointOh()?.connected ?? false

  const communityPower = useGovernancePowerAsync('community')
  const councilPower = useGovernancePowerAsync('council')

  const bothLoading = communityPower.loading && councilPower.loading

  const bothZero =
    communityPower.result !== undefined &&
    councilPower.result !== undefined &&
    communityPower.result.isZero() &&
    councilPower.result.isZero()

  return (
    <div>
      <GovernancePowerTitle />
      {!connected ? (
        <div className={'text-xs text-white/50 mt-8'}>
          Connect your wallet to see governance power
        </div>
      ) : bothLoading ? (
        <>
          <div className="h-12 mb-4 rounded-lg animate-pulse bg-bkg-3" />
          <div className="h-10 rounded-lg animate-pulse bg-bkg-3" />
        </>
      ) : bothZero ? (
        <div className={'text-xs text-white/50 mt-8'}>
          You do not have any governance power in this dao
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <GovernancePowerForRole role="community" />
          <GovernancePowerForRole role="council" />
        </div>
      )}
    </div>
  )
}

export default GovernancePowerCard
