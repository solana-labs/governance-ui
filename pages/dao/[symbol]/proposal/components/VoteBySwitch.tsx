import Switch from '@components/Switch'
import Tooltip from '@components/Tooltip'
import { QuestionMarkCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import React from 'react'

const VoteBySwitch = ({
  checked,
  onChange,
  disabled,
  label = 'Vote by council',
  tooltip = 'You can choose who vote on this proposal (council or community) if you have community token mint or council mint.',
}: {
  checked: boolean
  onChange: any
  disabled?: boolean
  label?: string
  tooltip?: string
}) => {
  const { toManyCouncilOutstandingProposalsForUse } = useRealm()

  return !toManyCouncilOutstandingProposalsForUse ? (
    <div className="text-sm mb-3 flex items-center gap-x-3 my-4">
      <div>{label}</div>

      <Tooltip content={tooltip}>
        <QuestionMarkCircleIcon className="w-5 h-5 text-fgd-3" />
      </Tooltip>

      <div className="flex flex-row text-xs items-center">
        <Switch disabled={disabled} checked={checked} onChange={onChange} />
      </div>
    </div>
  ) : null
}

export default VoteBySwitch
