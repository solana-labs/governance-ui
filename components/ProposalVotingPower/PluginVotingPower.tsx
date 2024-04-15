import classNames from 'classnames'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { getMintMetadata } from '@components/instructions/programs/splToken'
import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { useDelegatorAwareVoterWeight } from '@hooks/useDelegatorAwareVoterWeight'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import { GoverningTokenRole } from '@solana/spl-governance'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useMemo } from 'react'

interface Props {
  className?: string
  role: 'community' | 'council'
  showDepositButton?: boolean
}

export default function PluginVotingPower({
  role,
  className,
  showDepositButton = true,
}: Props) {
  const realm = useRealmQuery().data?.result
  const voterWeight = useDelegatorAwareVoterWeight(role)

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const { isReady } = useRealmVoterWeightPlugins(role)
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
    <div className={'p-3 rounded-md bg-bkg-1'}>
      <div className="flex items-center justify-between mt-1 w-full">
        <div className={`${clsx(className)} w-full`}>
          <div className="flex flex-col">
            <div className="text-fgd-3 text-xs">
              {tokenName}
              {role === 'council' ? ' Council' : ''} votes
            </div>
            <div className="flex items-center">
              <p className="font-bold mr-2 text-xl">{formattedTotal ?? '0'}</p>
              <p className="text-fgd-3 text-xs justify-self">
                ({formattedTokenAmount ?? '0'} tokens)
              </p>
            </div>
          </div>
          {showDepositButton && (
            <div className="text-xl font-bold text-fgd-1 hero-text">
              <TokenDeposit
                mint={mintInfo}
                tokenRole={GoverningTokenRole.Community}
                inAccountDetails={true}
                hideVotes={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
