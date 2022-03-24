import React from 'react'
import { capitalize } from '@utils/helpers'

const StatsView = ({ activeGovernance }) => {
  return (
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
  )
}

const DisplayField = ({ label, val, padding = false, bg = false }) => {
  return (
    <div
      className={`flex flex-col mb-2 ${bg ? 'bg-bkg-1' : ''} ${
        padding ? 'py-1' : ''
      }`}
    >
      <div className="text-xs text-fgd-3">{capitalize(label)}</div>
      <div className="text-sm break-all">{val}</div>
    </div>
  )
}

export default StatsView
