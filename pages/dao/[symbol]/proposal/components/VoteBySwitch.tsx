import Switch from '@components/Switch'
import React from 'react'

const VoteBySwitch = ({ checked, onChange }) => {
  return (
    <div className="text-sm mb-3">
      <div className="mb-2">Vote by council</div>
      <div className="flex flex-row text-xs items-center">
        <Switch checked={checked} onChange={onChange} />
      </div>
    </div>
  )
}

export default VoteBySwitch
