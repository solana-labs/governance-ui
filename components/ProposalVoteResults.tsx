import { Governance, ProgramAccount, Proposal } from '@solana/spl-governance'
import classNames from 'classnames'

import { VoterDisplayData, VoteType } from '@models/proposal'
import { formatPercentage } from '@utils/formatPercentage'

interface Props {
  className?: string
  data: VoterDisplayData[]
  governance: ProgramAccount<Governance>
  proposal: ProgramAccount<Proposal>
}

export default function ProposalVoteResult(props: Props) {
  const yesPercent = props.data.reduce((acc, cur) => {
    if (cur.voteType === VoteType.Yes) {
      return acc + cur.votePercentage
    }

    return acc
  }, 0)

  const noPercent = props.data.reduce((acc, cur) => {
    if (cur.voteType === VoteType.No) {
      return acc + cur.votePercentage
    }

    return acc
  }, 0)

  const threshold =
    props.proposal.account.voteThreshold?.value ||
    props.governance.account.config.communityVoteThreshold.value

  return (
    <div className={props.className}>
      <h3>Vote Result</h3>
      <div className="py-20">
        <div className="relative w-full h-4">
          <div className="absolute bg-neutral-600 top-0 left-0 right-0 bottom-0 rounded overflow-hidden">
            <div
              className="absolute bg-lime-600 left-0 top-0 bottom-0"
              style={{ width: `${yesPercent}%` }}
            />
            <div
              className="absolute bg-rose-700 right-0 top-0 bottom-0"
              style={{ width: `${noPercent}%` }}
            />
          </div>
          <div
            className={classNames(
              '-bottom-3',
              '-top-3',
              '-translate-x-1/2',
              'absolute',
              'bg-neutral-400',
              'left-1/2',
              'w-[3px]'
            )}
          />
          <div
            className={classNames(
              '-translate-x-1/2',
              'absolute',
              'bg-lime-600',
              'flex-col',
              'flex',
              'items-center',
              'p-2',
              'rounded',
              'text-white',
              'top-full',
              'translate-y-2',
              'after:-mb-[6px]',
              'after:-translate-x-1/2',
              'after:absolute',
              'after:bg-lime-600',
              'after:bottom-full',
              'after:h-[8px]',
              'after:left-1/2',
              'after:rotate-45',
              'after:w-[8px]',
              'after:z-20',
              "after:content-[' ']"
            )}
            style={{ left: `${yesPercent}%` }}
          >
            <div className="text-[8px] leading-3">Yay</div>
            <div className="text-sm font-bold">
              {formatPercentage(yesPercent)}
            </div>
          </div>
          <div
            className={classNames(
              'absolute',
              'bg-rose-700',
              'flex-col',
              'flex',
              'items-center',
              'p-2',
              'rounded',
              'text-white',
              'top-full',
              'translate-x-1/2',
              'translate-y-2',
              'after:-mb-[6px]',
              'after:-translate-x-1/2',
              'after:absolute',
              'after:bg-rose-700',
              'after:bottom-full',
              'after:h-[8px]',
              'after:left-1/2',
              'after:rotate-45',
              'after:w-[8px]',
              'after:z-20',
              "after:content-[' ']"
            )}
            style={{ right: `${noPercent}%` }}
          >
            <div className="text-[8px] leading-3">Nay</div>
            <div className="text-sm font-bold">
              {formatPercentage(noPercent)}
            </div>
          </div>
          {threshold && (
            <>
              <div
                className="absolute bg-purple-800 top-0 bottom-0 w-[3px]"
                style={{ left: `${threshold}%` }}
              />
              <div
                className={classNames(
                  '-translate-x-1/2',
                  '-translate-y-2',
                  'absolute',
                  'bg-purple-800',
                  'bottom-full',
                  'flex-col',
                  'flex',
                  'items-center',
                  'ml-[1px]',
                  'p-2',
                  'rounded',
                  'text-white',
                  'after:-mt-[6px]',
                  'after:-translate-x-1/2',
                  'after:absolute',
                  'after:bg-purple-800',
                  'after:h-[8px]',
                  'after:left-1/2',
                  'after:rotate-45',
                  'after:top-full',
                  'after:w-[8px]',
                  'after:z-20',
                  "after:content-[' ']"
                )}
                style={{ left: `${threshold}%` }}
              >
                <div className="text-[8px] leading-3">Threshold</div>
                <div className="text-sm font-bold">
                  {formatPercentage(threshold)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
