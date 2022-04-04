import { DisplayField } from '../index'

const StatsView = ({ activeGovernance }) => {
  return (
    <div>
      {activeGovernance && (
        <>
          <DisplayField
            label="Proposals Count"
            padding
            val={activeGovernance.account.proposalCount}
          />
          <DisplayField
            label="Voting Proposals Count"
            padding
            val={activeGovernance.account.votingProposalCount}
          />
        </>
      )}
    </div>
  )
}

export default StatsView
