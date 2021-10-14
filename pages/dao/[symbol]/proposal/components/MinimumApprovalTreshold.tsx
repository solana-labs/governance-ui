import useRealm from '@hooks/useRealm'
import React from 'react'

const MinimumApprovalTreshold = () => {
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
    <>
      {' '}
      <div className="mt-5">{`Minimum Approval votes ${voteThresholdPercentage}%`}</div>
      <div className="bg-black w-full h-2 mt-2">
        <div
          className="h-2"
          style={{ background: 'white', width: `${voteThresholdPercentage}%` }}
        ></div>
      </div>
    </>
  )
}

export default MinimumApprovalTreshold
