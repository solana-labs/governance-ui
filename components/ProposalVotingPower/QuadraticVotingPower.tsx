import classNames from 'classnames'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import {
  useRealmVoterWeightPlugins,
  useRealmVoterWeights,
} from '@hooks/useRealmVoterWeightPlugins'
import QuadraticVotingInfoModal from './QuadraticVotingInfoModal'
import { useMembersQuery } from '@components/Members/useMembers'
import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { GoverningTokenRole } from '@solana/spl-governance'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { BN } from '@coral-xyz/anchor'
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react'

interface Props {
  className?: string
  role: 'community' | 'council'
}

export default function QuadraticVotingPower({ role, className }: Props) {
  const realm = useRealmQuery().data?.result
  const { data: activeMembersData } = useMembersQuery()

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const activeMembers = useMemo(() => activeMembersData, [activeMembersData])

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const {
    calculatedVoterWeight,
    isReady,
    calculatedMaxVoterWeight,
    plugins,
  } = useRealmVoterWeightPlugins(role)
  const { result: ownVoterWeight } = useLegacyVoterWeight()

  const formattedTokenAmount = useMemo(
    () =>
      mintInfo && ownVoterWeight?.communityTokenRecord
        ? new BigNumber(
            ownVoterWeight?.communityTokenRecord?.account?.governingTokenDepositAmount?.toString()
          )
            .shiftedBy(-mintInfo.decimals)
            .toFixed(2)
            .toString()
        : undefined,
    [mintInfo, ownVoterWeight?.communityTokenRecord]
  )

  const relevantMint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const tokenName =
    getMintMetadata(relevantMint)?.name ?? realm?.account.name ?? ''

  const formattedMax =
    mintInfo && calculatedMaxVoterWeight?.value
      ? new BigNumber(calculatedMaxVoterWeight?.value.toString())
          .shiftedBy(-mintInfo.decimals)
          .toString()
      : undefined

  const formattedTotal = useMemo(
    () =>
      mintInfo && calculatedVoterWeight?.value
        ? new BigNumber(calculatedVoterWeight?.value.toString())
            .shiftedBy(-mintInfo.decimals)
            .toFixed(2)
            .toString()
        : undefined,
    [mintInfo, calculatedVoterWeight?.value]
  )

  const { communityWeight, councilWeight } = useRealmVoterWeights()
  const { gatewayStatus } = useGateway()
  const isQVEnabled = plugins?.voterWeight.some((p) => p.name === 'QV')
  const isGatewayEnabled = plugins?.voterWeight.some((p) => p.name === 'gateway')

  const hasAnyVotingPower =
    councilWeight?.value?.gt(new BN(0)) && communityWeight?.value?.gt(new BN(0))

  if (isLoading || !isReady) {
    return (
      <div
        className={classNames(
          className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div>
      {hasAnyVotingPower && isQVEnabled && (
        <div className="flex items-center mb-2">
          <p className="mb-1">Quadratic Voting</p>
          <QuadraticVotingInfoModal
            voteWeight={formattedTotal ?? '0'}
            tokenAmount={formattedTokenAmount ?? '0'}
            totalVoteWeight={formattedMax ?? '0'}
            totalMembers={activeMembers?.length ?? 0}
          />
        </div>
      )}
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1 w-full">
          <div className={`${clsx(className)} w-full`}>
            <div className="flex flex-col">
              <div className="text-fgd-3 text-xs">
                {tokenName}
                {role === 'council' ? ' Council' : ''} votes
              </div>
              <div className="flex items-center">
                <p className="font-bold mr-2 text-xl">
                  {formattedTotal ?? '0'}
                </p>
                <p className="text-fgd-3 text-xs justify-self">
                  ({formattedTokenAmount ?? '0'} tokens)
                </p>
              </div>
            </div>
            {!isGatewayEnabled ||
              (gatewayStatus === GatewayStatus.ACTIVE && (
                <div className="text-xl font-bold text-fgd-1 hero-text">
                  {/* Replace "Deposit" button with Join/Update button when a user needs to update */}
                  {/* Add copy explaining that user needds to update to vote */}
                  <TokenDeposit
                    mint={mintInfo}
                    tokenRole={GoverningTokenRole.Community}
                    inAccountDetails={true}
                    hideVotes={true}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
