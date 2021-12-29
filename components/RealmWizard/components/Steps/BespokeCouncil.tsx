/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { RealmWizardStepComponentProps } from '@components/RealmWizard/interfaces/Realm'
import Input from '@components/inputs/Input'

const BespokeCouncil: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  form,
  formErrors,
}) => {
  return (
    <>
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Council Settings</h1>
        </div>
      </div>
      <div className="pb-4 pr-10 mr-2">
        <Input
          label="Council Mint Id"
          placeholder="(Optional) Council mint"
          value={form?.councilMintId}
          type="text"
          error={formErrors['councilMintId'] || formErrors['councilMint']}
          onChange={(evt) => setForm({ councilMintId: evt.target.value })}
        />
      </div>
    </>
  )
}

export default BespokeCouncil
