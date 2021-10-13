import React, { useEffect, useState } from 'react'
import Input from '../../../../../components/inputs/Input'
import Select from '../../../../../components/inputs/Select'
import useRealm from '../../../../../hooks/useRealm'

const SplTokenTransferForm = ({ onChange }) => {
  const { realm, realmInfo } = useRealm()

  const [form, setForm] = useState({
    destinationAccount: '',
    amount: 1,
    sourceAccount: null,
    programId: realmInfo?.programId?.toString(),
    accountOwner: realm?.account?.owner,
  })

  const handleSetForm = ({ propertyName, value }) => {
    setForm({ ...form, [propertyName]: value })
  }

  useEffect(() => {
    onChange({ form })
  }, [form])

  useEffect(() => {
    handleSetForm({
      propertyName: 'accountOwner',
      value: realm?.account?.owner,
    })
  }, [realm?.account.owner])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: realmInfo?.programId?.toString(),
    })
  }, [realmInfo?.programId])

  return (
    <div>
      <div>Program id</div>
      <div>{form.programId}</div>
      <div>Account owner (governance account)</div>
      <div>{form.accountOwner}</div>
      <Select
        prefix="Source Account"
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'sourceAccount' })
        }
        value={form.sourceAccount?.name}
      >
        {[].map((acc) => (
          <Select.Option key={acc.id} value={acc}>
            <span>{acc.name}</span>
          </Select.Option>
        ))}
      </Select>
      <Input
        prefix="Destination account"
        value={form.destinationAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAccount',
          })
        }
      />
      <Input
        prefix="Amount"
        value={form.amount}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'amount',
          })
        }
      />
    </div>
  )
}

export default SplTokenTransferForm
