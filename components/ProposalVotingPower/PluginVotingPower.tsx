import classNames from 'classnames'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { GoverningTokenRole } from '@solana/spl-governance'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import QuadraticVotingInfoModal from './QuadraticVotingInfoModal'

interface Props {
  className?: string
  role: 'community' | 'council'
}

export default function PluginVotingPower({ role, className }: Props) {
  const realm = useRealmQuery().data?.result

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const {
    calculatedVoterWeight,
    isReady,
    plugins,
  } = useRealmVoterWeightPlugins(role)
  const isQuadratic =
    plugins?.findIndex((plugin) => plugin.name === 'QV') !== -1

  const formattedTotal =
    mintInfo && calculatedVoterWeight?.value
      ? new BigNumber(calculatedVoterWeight?.value.toString())
          .shiftedBy(-mintInfo.decimals)
          .toString()
      : undefined

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
    <div className={clsx(className)}>
      {isQuadratic ? (
        <div className="flex items-center">
          <p className="mb-2">Quadratic Voting</p>
          <QuadraticVotingInfoModal />
          {/* TODO Display quadratic voting card here */}
        </div>
      ) : (
        <div className={'p-3 rounded-md bg-bkg-1'}>
          <div className="flex items-center justify-between mt-1">
            <div className=" flex flex-col gap-x-2">
              <div
                className={clsx(
                  className,
                  !calculatedVoterWeight?.value ||
                    (calculatedVoterWeight.value.isZero() && 'hidden')
                )}
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
      )}
    </div>
  )
}
