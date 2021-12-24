import React from 'react'

const RealmCreated: React.FC<{ realmAddress: string }> = ({ realmAddress }) => {
  return (
    <>
      <h4>Your Realm was Created!</h4>
      Address: {realmAddress}
    </>
  )
}

export default RealmCreated
