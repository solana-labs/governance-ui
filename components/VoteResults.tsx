import VoteResultsBar from './VoteResultsBar'
import useProposalVotes from '@hooks/useProposalVotes'
import { Proposal } from '@solana/spl-governance'

type VoteResultsProps = {
  isListView?: boolean
  proposal: Proposal
}

const VoteResults = ({ isListView, proposal }: VoteResultsProps) => {
  const {
    yesVoteCount,
    noVoteCount,
    relativeNoVotes,
    relativeYesVotes,
  } = useProposalVotes(proposal)
  return (
    <div className="flex space-x-4 items-center">
      {proposal ? (
        <div
          className={`${!isListView ? 'bg-bkg-1 p-3' : ''} rounded-md w-full`}
        >
          <div className="flex">
            <div className="w-1/2">
              <p>Yes Votes</p>
              <p
                className={`font-bold text-fgd-1 ${
                  !isListView ? 'text-lg' : ''
                }`}
              >
                {yesVoteCount.toLocaleString()}
                {isListView ? (
                  <span className="font-normal ml-1 text-fgd-3 text-xs">
                    {relativeYesVotes?.toFixed(1)}%
                  </span>
                ) : null}
              </p>
              {!isListView ? (
                <div className="text-fgd-1 text-sm">
                  {relativeYesVotes?.toFixed(1)}%
                </div>
              ) : null}
            </div>
            <div className="text-right w-1/2">
              <p>No Votes</p>
              <p
                className={`font-bold text-fgd-1 ${
                  !isListView ? 'text-lg' : ''
                }`}
              >
                {noVoteCount.toLocaleString()}
                {isListView ? (
                  <span className="font-normal ml-1 text-fgd-3 text-xs">
                    {relativeNoVotes?.toFixed(1)}%
                  </span>
                ) : null}
              </p>
              {!isListView ? (
                <div className="text-fgd-1 text-sm">
                  {relativeNoVotes?.toFixed(1)}%
                </div>
              ) : null}
            </div>
          </div>
          <VoteResultsBar
            approveVotePercentage={relativeYesVotes!}
            denyVotePercentage={relativeNoVotes!}
          />
        </div>
      ) : (
        <>
          <div className="animate-pulse bg-bkg-3 h-12 rounded w-full" />
        </>
      )}
    </div>
  )
}

export default VoteResults
