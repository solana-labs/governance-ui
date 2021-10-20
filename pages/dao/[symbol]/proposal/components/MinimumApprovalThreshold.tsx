import ProgressBar from '@components/ProgressBar'
import useRealm from '@hooks/useRealm'
import React from 'react'

const MinimumApprovalThreshold = () => {
  const { realmInfo, governances } = useRealm()
  const governancesArray = Object.keys(governances).map(
    (key) => governances[key]
  )
  const programId = realmInfo?.programId?.toString()
  //todo ask if its good match to take it from here
  const voteThresholdPercentage = governancesArray.find(
    (x) => x.account?.owner?.toString() === programId
  )?.info?.config?.voteThresholdPercentage?.value

  return (
    <ProgressBar
      progress={voteThresholdPercentage}
      prefix="Minimum Approval votes"
    ></ProgressBar>
  )
}

export default MinimumApprovalThreshold
