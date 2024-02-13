import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { GoverningTokenRole } from '@solana/spl-governance'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useVoterWeightPlugins } from 'VoterWeightPlugins'
import { useMemo } from 'react'
import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";

interface Props {
  className?: string
}

export default function PluginVotingPower(props: Props) {
  const realm = useRealmQuery().data?.result

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const { voterWeight } = useRealmVoterWeightPlugins()

  const formattedTotal = useMemo(
    () =>
      mintInfo && voterWeight
        ? new BigNumber(voterWeight.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [mintInfo, voterWeight]
  )

  // TODO QV-2: isLoading should also use the usePlugins loading state
  if (isLoading || !voterWeight) {
    return (
      <div
        className={classNames(
          props.className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={clsx(props.className)}>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-col gap-x-2">
            <div
              className={clsx(props.className, voterWeight.isZero() && 'hidden')}
            >
              <div className={'p-3 rounded-md bg-bkg-1'}>
                <div className="text-fgd-3 text-xs">QV Votes</div>
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
