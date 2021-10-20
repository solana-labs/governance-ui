import ProgressBar from '@components/ProgressBar'

import { Governance } from '@models/accounts'
import React from 'react'

const MinimumApprovalThreshold = ({
  governance,
}: {
  governance: Governance | undefined
}) => {
  return (
    <ProgressBar
      progress={governance?.config.voteThresholdPercentage.value}
      prefix="Approval quorum"
    ></ProgressBar>
  )
}

export default MinimumApprovalThreshold
