import React, { useEffect, useState } from 'react'
import Input from '../../../../../components/inputs/Input'
import Select from '../../../../../components/inputs/Select'
import useRealm from '../../../../../hooks/useRealm'
import useWalletStore from '../../../../../stores/useWalletStore'

const SplTokenTransferForm = ({ onChange }) => {
  const { realm, realmInfo } = useRealm()
  const tokenAccounts = useWalletStore((s) => s.tokenAccounts)
  const programId = realmInfo?.programId?.toString()
  const accountOwner = realm?.pubkey.toString()

  const [form, setForm] = useState({
    destinationAccount: '',
    amount: 1,
    sourceAccount: null,
    programId: programId,
    accountOwner: accountOwner,
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
      value: accountOwner,
    })
  }, [realm?.account.owner])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId,
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
        {tokenAccounts.map((acc) => (
          <Select.Option key={acc.publicKey.toString()} value={acc}>
            <span>{acc.account.address}</span>
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
