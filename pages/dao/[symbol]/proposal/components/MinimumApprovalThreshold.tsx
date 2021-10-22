import ProgressBar from '@components/ProgressBar'

import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import React from 'react'

const MinimumApprovalThreshold = ({
  governance,
}: {
  governance: ParsedAccount<Governance> | null
}) => {
  const info = governance?.info
  return info ? (
    <ProgressBar
      progress={info?.config.voteThresholdPercentage.value}
      prefix="Approval quorum"
    ></ProgressBar>
  ) : null
}

export default MinimumApprovalThreshold
