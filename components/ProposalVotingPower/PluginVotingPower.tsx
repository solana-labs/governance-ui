import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { GoverningTokenRole } from '@solana/spl-governance'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

interface Props {
  className?: string
  role: 'community' | 'council'
}

export default function PluginVotingPower({ role, className }: Props) {
  const realm = useRealmQuery().data?.result

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)

  const { calculatedVoterWeight, isReady } = useRealmVoterWeightPlugins(role)

  const formattedTotal = useMemo(
    () =>
      mintInfo && calculatedVoterWeight?.value
        ? new BigNumber(calculatedVoterWeight?.value.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [mintInfo, calculatedVoterWeight?.value]
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

  console.log(222, calculatedVoterWeight)

  if (!calculatedVoterWeight?.value || calculatedVoterWeight.value.isZero()) {
    return null
  }

  return (
    <div className={clsx(className)}>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-col gap-x-2">
            <div className={clsx(className)}>
              <div className={'p-3 rounded-md bg-bkg-1'}>
                <div className="text-fgd-3 text-xs">Votes</div>
                <div className="flex items-center justify-between mt-1">
                  <div className=" flex flex-row gap-x-2">
                    <div className="text-xl font-bold text-fgd-1 hero-text">
                      {formattedTotal ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-fgd-1 hero-text">
              <TokenDeposit
                mint={mintInfo}
                tokenRole={GoverningTokenRole.Community}
                inAccountDetails={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
