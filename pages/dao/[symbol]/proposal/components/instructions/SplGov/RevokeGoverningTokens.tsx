import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import React, { useContext, useState } from 'react'
import { NewProposalContext } from '../../../new'
import useMembershipTypes from './useMembershipTypes'

type Form = {
  memberKey?: string
  membershipPopulation?: 'council' | 'community'
  amount?: number
}
type Errors = {
  [K in keyof Form]?: string
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const TokenAmountInput = ({}) => {}

const RevokeGoverningTokens = ({}) => {
  const { handleSetInstructions } = useContext(NewProposalContext)
  const [form, setForm] = useState<Form>({})
  const [formErrors, setFormErrors] = useState<Form>({})

  const membershipTypes = useMembershipTypes()

  return (
    <div>
      <Select
        label="Membership Type"
        value={form.membershipPopulation}
        onChange={(e) =>
          setForm((p) => ({ ...p, membershipPopulation: e.target.value }))
        }
      >
        {membershipTypes.map((x) => (
          <Select.Option key={x} value={x}>
            {capitalizeFirstLetter(x)}
          </Select.Option>
        ))}
      </Select>
      <Input
        label="Member Public Key"
        value={form.memberKey}
        type="text"
        onChange={(e) => setForm((p) => ({ ...p, memberKey: e.target.value }))}
        error={formErrors.memberKey}
      />
      <Input
        min={mintMinAmount}
        label="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />
    </div>
  )
}

export default RevokeGoverningTokens
