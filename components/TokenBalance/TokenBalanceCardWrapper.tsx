import useRealm from '@hooks/useRealm'
import dynamic from 'next/dynamic'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import GatewayCard from '@components/Gateway/GatewayCard'
import ClaimUnreleasedNFTs from './ClaimUnreleasedNFTs'
import Link from 'next/link'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import ClaimUnreleasedPositions from 'HeliumVotePlugin/components/ClaimUnreleasedPositions'
import VanillaAccountDetails from './VanillaAccountDetails'
import GovernancePowerCard from '@components/GovernancePower/GovernancePowerCard'
import SelectPrimaryDelegators from '@components/SelectPrimaryDelegators'
import PythAccountDetails from 'PythVotePlugin/components/PythAccountDetails'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import { ReactNode } from 'react'
import QuadraticVotingPower from '@components/ProposalVotingPower/QuadraticVotingPower'
import VanillaVotingPower from '@components/GovernancePower/Power/Vanilla/VanillaVotingPower'
import React from 'react'
import ParclAccountDetails from 'ParclVotePlugin/components/ParclAccountDetails'

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
  const { plugins } = useRealmVoterWeightPlugins('community')
  const requiredCards = plugins?.voterWeight.map((plugin) => plugin.name)

  const showHeliumCard = requiredCards?.includes('HeliumVSR')
  const showDefaultVSRCard = requiredCards?.includes('VSR')
  const showPythCard = requiredCards?.includes('pyth')
  const showNftCard = requiredCards?.includes('NFT')
  const showGatewayCard = requiredCards?.includes('gateway')
  const showQvCard = requiredCards?.includes('QV')
  const showParclCard = requiredCards?.includes('parcl');

  if (showDefaultVSRCard && inAccountDetails) {
    return <LockPluginTokenBalanceCard inAccountDetails={inAccountDetails} /> // does this ever actually occur in the component hierarchy?
  }

  const cards: ReactNode[] = []

  if (
    showHeliumCard &&
    (!ownTokenRecord ||
      ownTokenRecord.account.governingTokenDepositAmount.isZero())
  ) {
    cards.push(
      <React.Fragment key="helium">
        {!inAccountDetails && <GovernancePowerTitle />}
        <HeliumVotingPowerCard inAccountDetails={inAccountDetails} />
        <ClaimUnreleasedPositions inAccountDetails={inAccountDetails} />
      </React.Fragment>
    )
  }

  if (showNftCard && inAccountDetails) {
    cards.push(
      <div className="grid grid-cols-2 gap-x-2 w-full" key="nft">
        <div>
          <NftVotingPower inAccountDetails={inAccountDetails} />
          <ClaimUnreleasedNFTs inAccountDetails={inAccountDetails} />
        </div>
        <VanillaAccountDetails />
      </div>
    )
  }

  if (showPythCard) {
    cards.push(
      <React.Fragment key="pyth">
        {inAccountDetails ? <PythAccountDetails /> : <GovernancePowerCard />}
      </React.Fragment>
    )
  }

  if (showGatewayCard) {
    cards.push(
      <React.Fragment key="gateway">
        {inAccountDetails ? (
          <GatewayCard role="community" />
        ) : (
          <GovernancePowerCard />
        )}
      </React.Fragment>
    )
  }

  if (showQvCard) {
    cards.push(
      <React.Fragment key="qv">
        {inAccountDetails && (
          <>
            <QuadraticVotingPower role="community" />
            <VanillaVotingPower role="council" hideIfZero />
          </>
        )}
      </React.Fragment>
    )
  }

  if (showParclCard) {
    cards.push(
      <React.Fragment key="parcl">
        {!inAccountDetails && <GovernancePowerTitle />}
        <ParclAccountDetails />
      </React.Fragment>
    )
  }

  //Default
  if (cards.length === 0) {
    cards.push(
      <React.Fragment key="vanilla">
        {inAccountDetails ? <VanillaAccountDetails /> : <GovernancePowerCard />}
      </React.Fragment>
    )
  }

  return <>{cards}</>
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
