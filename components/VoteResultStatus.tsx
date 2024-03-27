import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/outline'
import { BanIcon } from '@heroicons/react/solid'
import useProposalVotes from '@hooks/useProposalVotes'
import { GovernanceAccountType, ProposalState, VoteType } from '@solana/spl-governance'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useVetoingPop } from './VotePanel/hooks'

const VetoResult = () => {
  const vetoingPop = useVetoingPop()
  return (
    <div className="bg-bkg-1 flex items-center p-3 rounded-md">
      <BanIcon className="h-5 mr-1.5 text-red w-5" />
      <h4 className="mb-0">Vetoed by the {vetoingPop}</h4>
    </div>
  )
}

const ApprovalResult = () => (
  <div className="bg-bkg-1 flex items-center p-3 rounded-md">
    <CheckCircleIcon className="h-5 mr-1.5 text-green w-5" />
    <h4 className="mb-0">The proposal has passed</h4>
  </div>
)

const MultiChoiceResult = () => (
  <div className="bg-bkg-1 flex items-center p-3 rounded-md">
    <CheckCircleIcon className="h-5 mr-1.5 text-green w-5" />
    <h4 className="mb-0">The proposal is completed</h4>
  </div>
)

const FailResult = () => {
  const proposal = useRouteProposalQuery().data?.result
  const voteData = useProposalVotes(proposal?.account)

  return voteData.yesVotesRequired === undefined ? null : (
    <div className="bg-bkg-1 p-3 rounded-md">
      <div className="flex items-center">
        <XCircleIcon className="h-5 mr-1.5 text-red w-5" />
        <div>
          <h4 className="mb-0">The proposal has failed</h4>
          <p className="mb-0 text-fgd-2">{`${voteData.yesVotesRequired.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 0,
            }
          )} more Yes vote${
            voteData.yesVotesRequired > 1 ? 's' : ''
          } were needed`}</p>
        </div>
      </div>
      <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
        <div
          style={{
            width: `${voteData.yesVoteProgress}%`,
          }}
          className={`bg-fgd-3 flex rounded`}
        ></div>
      </div>
    </div>
  )
}

const VoteResultStatus = () => {
  const proposal = useRouteProposalQuery().data?.result

  const status =
    proposal &&
    (proposal.account.state === ProposalState.Completed ||
    proposal.account.state === ProposalState.Executing ||
    proposal.account.state === ProposalState.SigningOff ||
    proposal.account.state === ProposalState.Succeeded ||
    proposal.account.state === ProposalState.ExecutingWithErrors
      ? 'approved'
      : proposal.account.state === ProposalState.Vetoed
      ? 'vetoed'
      : 'denied')

  const isMulti = proposal?.account.voteType !== VoteType.SINGLE_CHOICE
   && proposal?.account.accountType === GovernanceAccountType.ProposalV2

  return status === undefined ? null : status === 'approved' ? isMulti ?
  (
    <MultiChoiceResult />
  ) : (    
    <ApprovalResult />
  ) : status === 'vetoed' ? (
    <VetoResult />
  ) : (
    <FailResult />
  )
}

export default VoteResultStatus
