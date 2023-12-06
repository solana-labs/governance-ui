import useRealm from '@hooks/useRealm'
import dynamic from 'next/dynamic'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import { GATEWAY_PLUGINS_PKS, NFT_PLUGINS_PKS } from '@constants/plugins'
import GatewayCard from '@components/Gateway/GatewayCard'
import ClaimUnreleasedNFTs from './ClaimUnreleasedNFTs'
import Link from 'next/link'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import ClaimUnreleasedPositions from 'HeliumVotePlugin/components/ClaimUnreleasedPositions'
import VanillaAccountDetails from './VanillaAccountDetails'
import GovernancePowerCard from '@components/GovernancePower/GovernancePowerCard'
import SelectPrimaryDelegators from '@components/SelectPrimaryDelegators'

const LockPluginTokenBalanceCard = dynamic(
  () =>
    import(
      'VoteStakeRegistry/components/TokenBalance/LockPluginTokenBalanceCard'
    )
)

const HeliumVotingPowerCard = dynamic(() =>
  import('HeliumVotePlugin/components/VotingPowerCard').then((module) => {
    const { VotingPowerCard } = module
    return VotingPowerCard
  })
)

const NftVotingPower = dynamic(
  () => import('../ProposalVotingPower/NftVotingPower')
)

export const GovernancePowerTitle = () => {
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { data: tokenOwnerRecordPk } = useAddressQuery_CommunityTokenOwner()

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="mb-0">My governance power</h3>
      <Link href={fmtUrlWithCluster(`/dao/${symbol}/account/me`)}>
        <a
          className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
            !connected || !tokenOwnerRecordPk
              ? 'opacity-50 pointer-events-none'
              : ''
          }`}
        >
          View
          <ChevronRightIcon className="flex-shrink-0 w-6 h-6" />
        </a>
      </Link>
    </div>
  )
}

const TokenBalanceCardInner = ({
  inAccountDetails,
}: {
  inAccountDetails?: boolean
}) => {
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const config = useRealmConfigQuery().data?.result

  const { vsrMode } = useRealm()
  const currentPluginPk = config?.account?.communityTokenConfig.voterWeightAddin
  const isNftMode =
    currentPluginPk && NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())
  const isGatewayMode =
    currentPluginPk && GATEWAY_PLUGINS_PKS.includes(currentPluginPk?.toBase58())

  if (vsrMode === 'default' && inAccountDetails) {
    return <LockPluginTokenBalanceCard inAccountDetails={inAccountDetails} /> // does this ever actually occur in the component hierarchy?
  }

  if (
    vsrMode === 'helium' &&
    (!ownTokenRecord ||
      ownTokenRecord.account.governingTokenDepositAmount.isZero())
  ) {
    return (
      <>
        {!inAccountDetails && <GovernancePowerTitle />}
        <HeliumVotingPowerCard inAccountDetails={inAccountDetails} />
        <ClaimUnreleasedPositions inAccountDetails={inAccountDetails} />
      </>
    )
  }

  if (isNftMode && inAccountDetails) {
    return (
      <div className="grid grid-cols-2 gap-x-2 w-full">
        <div>
          <NftVotingPower inAccountDetails={inAccountDetails} />
          <ClaimUnreleasedNFTs inAccountDetails={inAccountDetails} />
        </div>
        <VanillaAccountDetails />
      </div>
    )
  }

  //Default
  return (
    <>
      {inAccountDetails ? <VanillaAccountDetails /> : <GovernancePowerCard />}

      {isGatewayMode && <GatewayCard />}
    </>
  )
}

const TokenBalanceCardWrapper = ({
  inAccountDetails,
}: {
  inAccountDetails?: boolean
}) => {
  return (
    <div
      className={`rounded-lg bg-bkg-2 ${inAccountDetails ? `` : `p-4 md:p-6`}`}
    >
      <TokenBalanceCardInner inAccountDetails={inAccountDetails} />
      <SelectPrimaryDelegators />
    </div>
  )
}

export default TokenBalanceCardWrapper
