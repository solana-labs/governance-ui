import React from 'react'
import { RealmWizardMode } from '@components/RealmWizard/interfaces/Realm'
import Tooltip from '@components/Tooltip'

const WizardModeSelect: React.FC<{
  onSelect: (option: number) => void
}> = ({ onSelect }) => {
  return (
    <>
      <h2 className="text-center">
        Create a decentralized organization (realm)
      </h2>
      <div className="grid grid-cols-1 gap-2 text-center ">
        <div className="flex justify-center pointer ">
          <div
            className="border rounded px-5 py-3 w-6/12 hover:bg-bkg-3"
            onClick={() => {
              onSelect(RealmWizardMode.BASIC)
            }}
          >
            <h2 className="mb-0">
              <b>I want to create a multisig realm</b>
            </h2>
            <p>
              Multisig Realm allows you to create an organization for your team
              members and jointly own and control shared assets like treasury
              accounts, programs or mints.
            </p>
          </div>
        </div>
        <div className="flex justify-center ">
          <div
            className="border rounded px-5 py-3 w-6/12 hover:bg-bkg-3 opacity-50"
            // onClick={() => {
            //   onSelect(RealmWizardMode.ADVANCED)
            // }}
          >
            <Tooltip content="This mode is not available yet.">
              <h2 className="mb-0">
                <b>I want to create a bespoke realm</b>
              </h2>
              <p>
                Bespoke realm is an advanced option and allows you to create a
                realm customized for your community, governance structure and
                individual requirements.
              </p>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  )
}

export default WizardModeSelect
