import classNames from 'classnames'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import QuadraticVotingInfoModal from './QuadraticVotingInfoModal'
import { useQuadraticVoterWeightPlugin } from '../../VoterWeightPlugins/useQuadraticVoterWeightPlugin'
import { useMembersQuery } from '@components/Members/useMembers'

interface Props {
  className?: string
  role: 'community' | 'council'
}

export default function PluginVotingPower({ role, className }: Props) {
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

  const { coefficients } = useQuadraticVoterWeightPlugin()

  console.log('plugins', plugins)
  const formattedTotal =
    mintInfo && calculatedVoterWeight?.value
      ? new BigNumber(calculatedVoterWeight?.value.toString())
          .shiftedBy(-mintInfo.decimals)
          .toString()
      : undefined

  const formattedMax =
    mintInfo && calculatedMaxVoterWeight?.value
      ? new BigNumber(calculatedMaxVoterWeight?.value.toString())
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

  if (!calculatedVoterWeight?.value || calculatedVoterWeight.value.isZero()) {
    return null
  }

  return (
    <div>
      <h3>My Voting Power</h3>
      <div className="flex items-center mb-2">
        <p className="mb-1">Quadratic Voting</p>
        <QuadraticVotingInfoModal
          voteWeight={formattedTotal ?? '0'}
          totalVoteWeight={formattedMax ?? '0'}
          coefficients={coefficients}
          totalMembers={activeMembers?.length ?? 0}
        />
      </div>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1">
          <div className={clsx(className)}>
            <div className="flex">
              <div className="flex flex-col">
                <p className="font-bold">
                  {formattedMax} tokens | {formattedTotal} votes
                </p>
                <p className="text-fgd-3">10% of possible votes</p>
              </div>
            </div>

            {/* <div className="text-xl font-bold text-fgd-1 hero-text">
              <TokenDeposit
                mint={mintInfo}
                tokenRole={GoverningTokenRole.Community}
                inAccountDetails={true}
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
