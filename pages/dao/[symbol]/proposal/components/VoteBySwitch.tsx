import Switch from '@components/Switch'
import React from 'react'

const VoteBySwitch = ({ checked, onChange }) => {
  return (
    <div className="text-sm mb-3">
      <div className="mb-2">Vote by</div>
      <div className="flex flex-row text-xs items-center">
        Community
        <Switch className="ml-2 mr-2" checked={checked} onChange={onChange} />
        Council
      </div>
    </div>
  )
}

export default VoteBySwitch
