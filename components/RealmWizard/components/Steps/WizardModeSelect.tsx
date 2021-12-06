import React from 'react'
import { RealmWizardMode } from '@components/RealmWizard/interfaces/Realm'

const WizardModeSelect: React.FC<{
  onSelect: (option: number) => void
}> = ({ onSelect }) => {
  return (
    <>
      <h2 className="text-center">
        Create a decentralized organization (Realm)
      </h2>
      <div className="grid grid-cols-1 gap-2 text-center">
        <div className="flex justify-center pointer">
          <div
            className="border rounded px-5 py-3 w-6/12"
            onClick={() => {
              onSelect(RealmWizardMode.BASIC)
            }}
          >
            <h2 className="mb-0">
              <b>I wanna create a new Realm</b>
            </h2>
            <p>We&apos;ll generate governance artifacts for you</p>
          </div>
        </div>
        <div className="flex justify-center pointer">
          <div
            className="border rounded px-5 py-3 w-6/12"
            onClick={() => {
              onSelect(RealmWizardMode.ADVANCED)
            }}
          >
            <h2 className="mb-0">
              <b>I already have a Realm</b>
            </h2>
            <p>You have your token details ready</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default WizardModeSelect
