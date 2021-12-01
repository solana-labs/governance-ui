import Button from '@components/Button'
import Input from '@components/inputs/Input'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
// import { precision } from '@utils/formatting'
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
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateMinMax = (e) => {
    const fieldName = e.target.name
    const min = e.target.min || 0
    const max = e.target.max || Number.MAX_SAFE_INTEGER
    const value = form[fieldName]
    //todo
    const currentPrecision = 0 //precision(min)

    handleSetForm({
      value: parseFloat(
        Math.max(Number(min), Math.min(Number(max), Number(value))).toFixed(
          currentPrecision
        )
      ),
      propertyName: fieldName,
    })
  }
  const handleCreate = () => {
    setIsLoading(true)
    setIsLoading(false)
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
      <Input
        label="Min community tokens to create proposal"
        value={form.minCommunityTokensToCreateProposal}
        type="number"
        name="minCommunityTokensToCreateProposal"
        min={0.001}
        max={10000}
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'minCommunityTokensToCreateProposal',
          })
        }
        error={formErrors['minCommunityTokensToCreateProposal']}
      />
      <Input
        label="min instruction hold up time (days)"
        value={form.minInstructionHoldUpTime}
        type="number"
        min={0}
        name="minInstructionHoldUpTime"
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'minInstructionHoldUpTime',
          })
        }
        error={formErrors['minInstructionHoldUpTime']}
      />
      <Input
        label="Max voting time (days)"
        value={form.maxVotingTime}
        name="maxVotingTime"
        type="number"
        min={1}
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maxVotingTime',
          })
        }
        error={formErrors['maxVotingTime']}
      />
      <Input
        label="Yes vote threshold (%)"
        value={form.voteThreshold}
        max={100}
        min={1}
        name="voteThreshold"
        type="number"
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'voteThreshold',
          })
        }
        error={formErrors['voteThreshold']}
      />
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Button isLoading={isLoading} onClick={handleCreate}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default NewAccountForm
