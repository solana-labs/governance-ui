import { Proposal, ProposalState } from '@solana/spl-governance'
import { fmtUnixTime } from '../utils/formatting'
import ProposalTimer from './ProposalTimer'
import { useGovernanceByPubkeyQuery } from '@hooks/queries/governance'

type ProposalTimeStatusProps = {
  proposal: Proposal
}

const ProposalTimeStatus = ({ proposal }: ProposalTimeStatusProps) => {
  const governance = useGovernanceByPubkeyQuery(proposal.governance).data
    ?.result

  return proposal && governance ? (
    <div className="flex items-center text-fgd-3 text-sm">
      {proposal.votingCompletedAt ? (
        `${ProposalState[proposal.state]} ${fmtUnixTime(
          proposal.votingCompletedAt
        )}`
      ) : proposal.votingAt ? (
        <ProposalTimer proposal={proposal} governance={governance.account} />
      ) : (
        `Drafted ${fmtUnixTime(proposal.draftAt)}`
      )}
    </div>
  ) : null
}

export default ProposalTimeStatus
