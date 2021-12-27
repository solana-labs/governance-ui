import { PublicKey } from '@solana/web3.js'
import React from 'react'

const RealmCreated: React.FC<{
  realmAddress: PublicKey
  governanceProgramId: string
}> = ({ realmAddress, governanceProgramId }) => {
  return (
    <>
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Realm created succesfully!</h1>
        </div>
      </div>
      <div>
        <div className="pb-5">
          Details about your realm here. These can be added manually to your
          local registry of realms similar to here
          <div>
            <a
              target="_blank"
              href="https://github.com/blockworks-foundation/governance-ui/blob/main/models/registry/api.ts"
              rel="noreferrer"
            >
              https://github.com/blockworks-foundation/governance-ui/blob/main/models/registry/api.ts
            </a>
          </div>
          <div>This is a temporary solution.</div>
        </div>
        <div>
          <div className="pt-2">
            <div className="pb-0.5 text-fgd-3 text-xs">
              Governance Program Id
            </div>
            <div className="text-xs">{governanceProgramId}</div>
          </div>
          <div className="pt-2">
            <div className="pb-0.5 text-fgd-3 text-xs">Realm Id</div>
            <div className="text-xs">{realmAddress?.toBase58()}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RealmCreated
