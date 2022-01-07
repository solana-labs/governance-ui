import Switch from '@components/Switch'
import Tooltip from '@components/Tooltip'
import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import React from 'react'

const VoteBySwitch = ({ checked, onChange, disabled }) => {
  const { toManyCouncilOutstandingProposalsForUse } = useRealm()

  return !toManyCouncilOutstandingProposalsForUse ? (
    <div className="text-sm mb-3 flex items-center gap-x-3">
      <div>Vote by council</div>

      <Tooltip content="You can choose who vote on this proposal (council or community) if you have community token mint or council mint.">
        <QuestionMarkCircleIcon className="w-5 h-5 text-fgd-3" />
      </Tooltip>

      <div className="flex flex-row text-xs items-center">
        <Switch disabled={disabled} checked={checked} onChange={onChange} />
      </div>
    </div>
  ) : null
}

export default VoteBySwitch
