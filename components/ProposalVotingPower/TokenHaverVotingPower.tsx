import classNames from 'classnames'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { getMintMetadata } from '@components/instructions/programs/splToken'
import { useRealmQuery } from '@hooks/queries/realm'
import { useDelegatorAwareVoterWeight } from '@hooks/useDelegatorAwareVoterWeight'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import clsx from 'clsx'

interface Props {
  className?: string
  role: 'community' | 'council'
  showDepositButton?: boolean
}

export default function TokenHaverVotingPower({ role, className }: Props) {
  const realm = useRealmQuery().data?.result
  const voterWeight = useDelegatorAwareVoterWeight(role)

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const { isReady } = useRealmVoterWeightPlugins(role)

  const relevantMint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const tokenName =
    getMintMetadata(relevantMint)?.name ?? realm?.account.name ?? ''

  const formattedTotal = voterWeight?.value?.toString() ?? 0

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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
