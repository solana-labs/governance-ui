import VoteResultsBar from './VoteResultsBar'
import {
  Governance,
  ProgramAccount,
  Proposal,
  Realm,
} from '@solana/spl-governance'
import useProposalVotesForRealm from '@hooks/useProposalVotesForRealm'

type VoteResultsForRealmProps = {
  isListView?: boolean
  proposal: Proposal
  realm: ProgramAccount<Realm>
  governance?: ProgramAccount<Governance>
}

const VoteResultsForRealmProposal = ({
  isListView,
  proposal,
  realm,
  governance,
}: VoteResultsForRealmProps) => {
  const {
    yesVoteCount,
    noVoteCount,
    relativeNoVotes,
    relativeYesVotes,
  } = useProposalVotesForRealm(realm, proposal, governance)

  return (
    <div className="flex items-center space-x-4">
      {proposal ? (
        <div
          className={`${!isListView ? 'bg-bkg-1 p-3' : ''} rounded-md w-full`}
        >
          <div className="flex">
            <div className="w-1/2">
              <p>Yes Votes</p>
              <p
                className={`font-bold text-fgd-1 ${
                  !isListView ? 'hero-text' : ''
                }`}
              >
                {yesVoteCount.toLocaleString()}
                {isListView ? (
                  <span className="ml-1 text-xs font-normal text-fgd-3">
                    {relativeYesVotes?.toFixed(1)}%
                  </span>
                ) : null}
              </p>
              {!isListView ? (
                <div className="text-sm text-fgd-1">
                  {relativeYesVotes?.toFixed(1)}%
                </div>
              ) : null}
            </div>
            <div className="w-1/2 text-right">
              <p>No Votes</p>
              <p
                className={`font-bold text-fgd-1 ${
                  !isListView ? 'hero-text' : ''
                }`}
              >
                {noVoteCount.toLocaleString()}
                {isListView ? (
                  <span className="ml-1 text-xs font-normal text-fgd-3">
                    {relativeNoVotes?.toFixed(1)}%
                  </span>
                ) : null}
              </p>
              {!isListView ? (
                <div className="text-sm text-fgd-1">
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
          <div className="w-full h-12 rounded animate-pulse bg-bkg-3" />
        </>
      )}
    </div>
  )
}

export default VoteResultsForRealmProposal
