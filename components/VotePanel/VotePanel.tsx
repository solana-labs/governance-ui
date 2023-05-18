import { ProposalState } from '@solana/spl-governance'
import { BanIcon } from '@heroicons/react/solid'

import Tooltip from '@components/Tooltip'
import VetoButtons from './VetoButtons'
import { CastVoteButtons } from './CastVoteButtons'
import { YouVoted } from './YouVoted'
import { useIsVoting, useProposalVoteRecordQuery } from './hooks'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRouteProposalQuery } from '@hooks/queries/proposal'

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

  return (
    <>
      {didNotVote && (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg flex flex-col items-center justify-center">
          <h3 className="text-center mb-0">You did not vote electorally</h3>
          <Tooltip content="You did not vote on this proposal">
            <BanIcon className="h-[34px] w-[34px] fill-white/50 mt-2" />
          </Tooltip>
        </div>
      )}
      {/* START: Note that these components control for themselves whether they are displayed and may not be visible */}
      <YouVoted quorum="electoral" />
      <CastVoteButtons />
      <YouVoted quorum="veto" />
      <VetoButtons />
      {/* END */}
    </>
  )
}

export default VotePanel
