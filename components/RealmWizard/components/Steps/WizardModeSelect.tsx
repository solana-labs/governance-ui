import React from 'react'
import { RealmWizardMode } from '@components/RealmWizard/interfaces/Realm'

const WizardModeSelect: React.FC<{
  onSelect: (option: number) => void
}> = ({ onSelect }) => {
  return (
    <>
      <h2 className="text-center">
        Create a Decentralized Autonomous Organization (DAO)
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
              <b>I want to create a multisig DAO</b>
            </h2>
            <p>
              Multisig DAO allows you to create an organization for your team
              members and jointly own and manage shared assets like treasury
              accounts, NFTs, programs or mints.
            </p>
          </div>
        </div>
        <div className="flex justify-center ">
          <div
            className="border rounded px-5 py-3 w-6/12 hover:bg-bkg-3 pointer"
            onClick={() => {
              onSelect(RealmWizardMode.ADVANCED)
            }}
          >
            <h2 className="mb-0">
              <b>I want to create a bespoke DAO</b>
            </h2>
            <p>
              Bespoke DAO is an advanced option and allows you to create a DAO
              customized for your individual requirements, community structure
              and governance token setup.
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <a
          href="https://governance-docs.vercel.app/multisig-DAO/create-multisig-DAO/DAO-wizard"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="border rounded px-3 py-1.5 hover:border-primary-light hover:bg-bkg-3 hover:text-primary-dark transition-all duration-200 pointer mt-10 ">
            <span className="font-semibold text-sm">Tutorial Docs</span>
          </div>
        </a>
      </div>
    </>
  )
}

export default WizardModeSelect
