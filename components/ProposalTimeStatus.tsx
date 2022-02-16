import useRealm from '../hooks/useRealm'
import { Proposal, ProposalState } from '@solana/spl-governance'
import { fmtUnixTime } from '../utils/formatting'
import { VoteCountdown } from './VoteCountdown'

type ProposalTimeStatusProps = {
  proposal: Proposal
}

const ProposalTimeStatus = ({ proposal }: ProposalTimeStatusProps) => {
  const { governances } = useRealm()
  const governance = governances[proposal?.governance.toBase58()]?.account

  return proposal && governance ? (
    <div className="flex items-center text-fgd-3 text-sm">
      {proposal.votingCompletedAt ? (
        `${ProposalState[proposal.state]} ${fmtUnixTime(
          proposal.votingCompletedAt
        )}`
      ) : proposal.votingAt ? (
        <VoteCountdown proposal={proposal} governance={governance} />
      ) : (
        `Drafted ${fmtUnixTime(proposal.draftAt)}`
      )}
    </div>
  ) : null
}

export default ProposalTimeStatus
