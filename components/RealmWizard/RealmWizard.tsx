import React from 'react'
import BN from 'bn.js'
import { ProgramAccount } from 'utils/tokens'
import { MintInfo } from '@solana/spl-token'
import { ProgramVersion } from '@models/registry/api'
import { useState } from 'react'
import CreateRealmForm from './components/CreateRealmForm'
import Loading from '@components/Loading'
import CreateRealmOptions from './components/CreateRealmOptions'

export interface CreateRealmProps {
  governanceProgramId: string
  name: string
  communityMintId: string
  communityMint?: ProgramAccount<MintInfo>
  councilMintId: string
  councilMint?: ProgramAccount<MintInfo>
  teamWallets: string[]
  programVersion: ProgramVersion
  communityMintMaxVoteWeightSource?: number
  minCommunityTokensToCreateGovernance: BN
}

const RealmWizard: React.FC = () => {
  const [realmArtifacts, setRealmArtifacts] = useState<CreateRealmProps>()
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Generate program artifacts
   */
  const generateProgramArtifacts = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowForm(true)
      const artifacts: CreateRealmProps = {
        name: 'Realm-EZUBS',
        programVersion: 1,
        governanceProgramId: 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
        communityMintId: 'EZUBSaFK4jVPxk5ChMmbNGtiXkRsuf1E2soDi5GmcdCN',
        councilMintId: '9DPEfrW5y1AoB1B2NU77BQmEDJvrtkxJTQE2pr729DAm',
        minCommunityTokensToCreateGovernance: new BN(1000000),
        teamWallets: [],
      }
      setRealmArtifacts(artifacts)
    }, 1000)
  }

  return (
    <div className="relative">
      {isLoading ? (
        <div className="text-center">
          <Loading />
          <span>Creating Realm..</span>
        </div>
      ) : (
        <>
          {showForm ? (
            <CreateRealmForm artifacts={realmArtifacts} />
          ) : (
            <CreateRealmOptions
              onSelect={() => {
                generateProgramArtifacts()
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default RealmWizard
