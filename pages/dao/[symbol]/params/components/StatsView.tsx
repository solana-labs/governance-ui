import { AddressField, NumberField } from '../index'

const StatsView = ({ activeGovernance }) => {
  return (
    <div>
      {activeGovernance && (
        <>
          <AddressField
            label="Proposals Count"
            padding
            val={activeGovernance.account.proposalCount}
          />
          <NumberField
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
