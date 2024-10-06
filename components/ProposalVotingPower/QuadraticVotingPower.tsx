import classNames from 'classnames'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { GatewayStatus, useGateway } from '@civic/solana-gateway-react'
import { BN } from '@coral-xyz/anchor'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { useDelegatorAwareVoterWeight } from '@hooks/useDelegatorAwareVoterWeight'
import {
  useRealmVoterWeightPlugins,
  useRealmVoterWeights,
} from '@hooks/useRealmVoterWeightPlugins'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import PluginVotingPower from './PluginVotingPower'
import QuadraticVotingInfoModal from './QuadraticVotingInfoModal'
import { useTokenOwnerRecordsForRealmQuery } from '@hooks/queries/tokenOwnerRecord'
import { Member } from '@utils/uiTypes/members'

interface Props {
  className?: string
  role: 'community' | 'council'
}

export default function QuadraticVotingPower({ role, className }: Props) {
  const realm = useRealmQuery().data?.result
  const { data: activeMembersData } = useTokenOwnerRecordsForRealmQuery()
  const voterWeight = useDelegatorAwareVoterWeight(role)

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const activeMembers: Member[] | undefined = useMemo(() => activeMembersData?.map(member => ({
    walletAddress: member.account.governingTokenOwner.toBase58(),
    communityVotes: new BN(0),
    councilVotes: new BN(0)
  })), [activeMembersData])

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const {
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

  const formattedMax =
    mintInfo && calculatedMaxVoterWeight?.value
      ? new BigNumber(calculatedMaxVoterWeight?.value.toString())
          .shiftedBy(-mintInfo.decimals)
          .toString()
      : undefined

  const formattedTotal = useMemo(
    () =>
      mintInfo && voterWeight?.value
        ? new BigNumber(voterWeight?.value.toString())
            .shiftedBy(-mintInfo.decimals)
            .toFixed(2)
            .toString()
        : undefined,
    [mintInfo, voterWeight?.value]
  )

  const { communityWeight, councilWeight } = useRealmVoterWeights()
  const { gatewayStatus } = useGateway()
  const isQVEnabled = plugins?.voterWeight.some((p) => p.name === 'QV')
  const isGatewayEnabled = plugins?.voterWeight.some(
    (p) => p.name === 'gateway'
  )

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
      {
        // check if the last plugin is gateway to show the voting power
        plugins?.voterWeight[plugins.voterWeight.length - 1].name === 'QV' && (
          <PluginVotingPower
            role={role}
            showDepositButton={
              !isGatewayEnabled || gatewayStatus === GatewayStatus.ACTIVE
            }
          />
        )
      }
    </div>
  )
}
