import ProgressBar from '@components/ProgressBar'

import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import React from 'react'

const MinimumApprovalThreshold = ({
  governance,
}: {
  governance: ProgramAccount<Governance> | null
}) => {
  const info = governance?.account
  // const info = { config: { voteThresholdPercentage: { value: 50 } } }
  return info ? (
    <ProgressBar
      progress={info?.config.voteThresholdPercentage.value}
      prefix="Approval quorum"
    ></ProgressBar>
  ) : null
}

export default MinimumApprovalThreshold
