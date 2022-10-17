import { Proposal } from '@solana/spl-governance'
import { Option } from 'tools/core/option'
import useRealm from '@hooks/useRealm'
import dynamic from 'next/dynamic'
import {
  gatewayPluginsPks,
  nftPluginsPks,
  vsrPluginsPks,
  switchboardPluginsPks,
} from '@hooks/useVotingPlugins'
import GatewayCard from '@components/Gateway/GatewayCard'
import ClaimUnreleasedNFTs from './ClaimUnreleasedNFTs'

const LockPluginTokenBalanceCard = dynamic(
  () =>
    import(
      'VoteStakeRegistry/components/TokenBalance/LockPluginTokenBalanceCard'
    )
)
const TokenBalanceCard = dynamic(() => import('./TokenBalanceCard'))
const NftBalanceCard = dynamic(() => import('./NftBalanceCard'))
const SwitchboardPermissionCard = dynamic(
  () => import('./SwitchboardPermissionCard')
)

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
  } = useRealm()
  const currentPluginPk = config?.account?.communityTokenConfig.voterWeightAddin
  const getTokenBalanceCard = () => {
    //based on realm config it will provide proper tokenBalanceCardComponent
    const isLockTokensMode =
      currentPluginPk && vsrPluginsPks.includes(currentPluginPk?.toBase58())
    const isNftMode =
      currentPluginPk && nftPluginsPks.includes(currentPluginPk?.toBase58())
    const isGatewayMode =
      currentPluginPk && gatewayPluginsPks.includes(currentPluginPk?.toBase58())
    const isSwitchboardMode =
      currentPluginPk &&
      switchboardPluginsPks.includes(currentPluginPk?.toBase58())

    if (
      isLockTokensMode &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return (
        <LockPluginTokenBalanceCard
          inAccountDetails={inAccountDetails}
        ></LockPluginTokenBalanceCard>
      )
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
            <TokenBalanceCard
              proposal={proposal}
              inAccountDetails={inAccountDetails}
            >
              <div className="mb-4" />
              <NftBalanceCard
                inAccountDetails={inAccountDetails}
                showView={false}
              />
              <ClaimUnreleasedNFTs inAccountDetails={inAccountDetails} />
            </TokenBalanceCard>
          ) : (
            <>
              <NftBalanceCard
                inAccountDetails={inAccountDetails}
                showView={!inAccountDetails}
              />
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
      <TokenBalanceCard proposal={proposal} inAccountDetails={inAccountDetails}>
        {/*Add the gateway card if this is a gated DAO*/}
        {isGatewayMode && <GatewayCard></GatewayCard>}
      </TokenBalanceCard>
    )
  }
  return (
    <div className={`rounded-lg bg-bkg-2 p-4 md:p-6`}>
      {getTokenBalanceCard()}
    </div>
  )
}

export default TokenBalanceCardWrapper
