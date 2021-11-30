import Input from '@components/inputs/Input'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import React, { useState } from 'react'

interface NewTreasuryAccountForm {
  mintAddress: string
  minCommunityTokensToCreateProposal: number
  minInstructionHoldUpTime: number
  maxVotingTime: number
  voteThreshold: number
}

const NewAccountForm = () => {
  const [form, setForm] = useState<NewTreasuryAccountForm>({
    mintAddress: '',
    minCommunityTokensToCreateProposal: 100,
    minInstructionHoldUpTime: 0,
    maxVotingTime: 3,
    voteThreshold: 60,
  })
  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  return (
    <div className="space-y-3">
      <PreviousRouteBtn />
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create new treasury account</h1>
        </div>
      </div>
      <Input
        label="Mint address"
        value={form.mintAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mintAddress',
          })
        }
        error={formErrors['mintAddress']}
      />
    </div>
  )
}

export default NewAccountForm
