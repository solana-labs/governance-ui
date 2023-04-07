import { Proposal } from '@solana/spl-governance'
import { Option } from 'tools/core/option'
import useRealm from '@hooks/useRealm'
import dynamic from 'next/dynamic'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import {
  gatewayPluginsPks,
  nftPluginsPks,
  switchboardPluginsPks,
} from '@hooks/useVotingPlugins'
import GatewayCard from '@components/Gateway/GatewayCard'
import ClaimUnreleasedNFTs from './ClaimUnreleasedNFTs'
import Link from 'next/link'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwner'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

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

const TokenBalanceCard = dynamic(() => import('./TokenBalanceCard'))
const NftVotingPower = dynamic(
  () => import('../ProposalVotingPower/NftVotingPower')
)
// const NftBalanceCard = dynamic(() => import('./NftBalanceCard'))
const SwitchboardPermissionCard = dynamic(
  () => import('./SwitchboardPermissionCard')
)

const GovernancePowerTitle = () => {
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { data: tokenOwnerRecordPk } = useAddressQuery_CommunityTokenOwner()

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="mb-0">My governance power</h3>
      <Link
        href={fmtUrlWithCluster(`/dao/${symbol}/account/${tokenOwnerRecordPk}`)}
      >
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

const TokenBalanceCardWrapper = ({
  proposal,
  inAccountDetails,
}: {
  proposal?: Option<Proposal>
  inAccountDetails?: boolean
}) => {
  const {
    ownTokenRecord,
    config,
    ownCouncilTokenRecord,
    councilTokenAccount,
    vsrMode,
  } = useRealm()
  const currentPluginPk = config?.account?.communityTokenConfig.voterWeightAddin
  const getTokenBalanceCard = () => {
    const isNftMode =
      currentPluginPk && nftPluginsPks.includes(currentPluginPk?.toBase58())
    const isGatewayMode =
      currentPluginPk && gatewayPluginsPks.includes(currentPluginPk?.toBase58())
    const isSwitchboardMode =
      currentPluginPk &&
      switchboardPluginsPks.includes(currentPluginPk?.toBase58())

    if (
      vsrMode === 'default' &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return <LockPluginTokenBalanceCard inAccountDetails={inAccountDetails} />
    }

    if (
      vsrMode === 'helium' &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return <HeliumVotingPowerCard inAccountDetails={inAccountDetails} />
    }

    if (
      isNftMode &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return (
        <>
          {(ownCouncilTokenRecord &&
            !ownCouncilTokenRecord?.account.governingTokenDepositAmount.isZero()) ||
          (councilTokenAccount &&
            !councilTokenAccount?.account.amount.isZero()) ? (
            <>
              {!inAccountDetails && <GovernancePowerTitle />}
              <NftVotingPower inAccountDetails={inAccountDetails} />
              <TokenBalanceCard
                proposal={proposal}
                inAccountDetails={inAccountDetails}
              />
              <ClaimUnreleasedNFTs inAccountDetails={inAccountDetails} />
            </>
          ) : (
            <>
              {!inAccountDetails && <GovernancePowerTitle />}
              <NftVotingPower inAccountDetails={inAccountDetails} />
              <ClaimUnreleasedNFTs inAccountDetails={inAccountDetails} />
            </>
          )}
        </>
      )
    }
    if (
      isSwitchboardMode &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return <SwitchboardPermissionCard></SwitchboardPermissionCard>
    }
    //Default
    return (
      <>
        {!inAccountDetails && <GovernancePowerTitle />}
        <TokenBalanceCard
          proposal={proposal}
          inAccountDetails={inAccountDetails}
        >
          {/*Add the gateway card if this is a gated DAO*/}
          {isGatewayMode && <GatewayCard></GatewayCard>}
        </TokenBalanceCard>
      </>
    )
  }
  return (
    <div
      className={`rounded-lg bg-bkg-2 ${inAccountDetails ? `` : `p-4 md:p-6`}`}
    >
      {getTokenBalanceCard()}
    </div>
  )
}

export default TokenBalanceCardWrapper
