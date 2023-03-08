import { Proposal } from '@solana/spl-governance'
import { Option } from 'tools/core/option'
import useRealm from '@hooks/useRealm'
import dynamic from 'next/dynamic'
import { ChevronRightIcon } from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import {
  gatewayPluginsPks,
  nftPluginsPks,
  vsrPluginsPks,
  switchboardPluginsPks,
} from '@hooks/useVotingPlugins'
import GatewayCard from '@components/Gateway/GatewayCard'
import ClaimUnreleasedNFTs from './ClaimUnreleasedNFTs'
import Link from 'next/link'
import { getTokenOwnerRecordAddress } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { useEffect, useState } from 'react'

const LockPluginTokenBalanceCard = dynamic(
  () =>
    import(
      'VoteStakeRegistry/components/TokenBalance/LockPluginTokenBalanceCard'
    )
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
  const { councilMint, mint, realm, symbol } = useRealm()
  const [tokenOwnerRecordPk, setTokenOwneRecordPk] = useState('')
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      if (realm === undefined) return
      if (!wallet?.publicKey) return

      const defaultMint = !mint?.supply.isZero()
        ? realm.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm.account.config.councilMint
        : undefined

      if (defaultMint === undefined) return

      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm.owner,
        realm.pubkey,
        defaultMint,
        wallet?.publicKey
      )
      setTokenOwneRecordPk(tokenOwnerRecordAddress.toBase58())
    }
    getTokenOwnerRecord()
  }, [councilMint?.supply, mint?.supply, realm, wallet?.publicKey])

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
