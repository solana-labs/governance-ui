import { GovernanceAccountType, ProposalState, VoteType } from '@solana/spl-governance'
import { BanIcon } from '@heroicons/react/solid'

import Tooltip from '@components/Tooltip'
import VetoButtons from './VetoButtons'
import { CastVoteButtons } from './CastVoteButtons'
import { CastMultiVoteButtons } from './CastMultiVoteButtons'
import { YouVoted } from './YouVoted'
import { useIsVoting } from './hooks'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'

const VotePanel = () => {
  const proposal = useRouteProposalQuery().data?.result
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')

  const isVoteCast = ownVoteRecord?.result !== undefined
  const isVoting = useIsVoting()

  const didNotVote =
    connected &&
    !!proposal &&
    !isVoting &&
    proposal.account.state !== ProposalState.Cancelled &&
    proposal.account.state !== ProposalState.Draft &&
    !isVoteCast

  const isMulti = proposal?.account.voteType !== VoteType.SINGLE_CHOICE
    && proposal?.account.accountType === GovernanceAccountType.ProposalV2

  return (
    <>
      {didNotVote && (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg flex flex-col items-center justify-center">
          <h3 className="text-center mb-0">
            {isMulti
              ? 'You did not vote on this proposal'
              : 'You did not vote electorally'}
          </h3>
          <Tooltip content="You did not vote on this proposal">
            <BanIcon className="h-[34px] w-[34px] fill-white/50 mt-2" />
          </Tooltip>
        </div>
      )}
      {/* START: Note that these components control for themselves whether they are displayed and may not be visible */}
      <YouVoted quorum="electoral" />
      {proposal && isMulti ? (
        <CastMultiVoteButtons proposal={proposal.account} />
      ) : (
        <CastVoteButtons />
      )}
      <YouVoted quorum="veto" />
      {!isMulti && <VetoButtons />}
      {/* END */}
    </>
  )
}

export default VotePanel
