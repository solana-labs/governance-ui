import Switch from '@components/Switch'
import useRealm from '@hooks/useRealm'
import React from 'react'

const VoteBySwitch = ({ checked, onChange }) => {
  const { toManyCouncilOutstandingProposalsForUse } = useRealm()
  return !toManyCouncilOutstandingProposalsForUse ? (
    <div className="text-sm mb-3">
      <div className="mb-2">Vote by council</div>
      <div className="flex flex-row text-xs items-center">
        <Switch checked={checked} onChange={onChange} />
      </div>
    </div>
  ) : null
}

export default VoteBySwitch
