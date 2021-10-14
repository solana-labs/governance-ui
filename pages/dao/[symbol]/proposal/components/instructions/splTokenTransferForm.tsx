import React, { useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useRealm from '@hooks/useRealm'
import { GovernanceAccountType } from '@models/accounts'

const SplTokenTransferForm = ({ onChange }) => {
  const { realm, realmInfo, governances } = useRealm()

  const governancesArray = Object.keys(governances).map(
    (key) => governances[key]
  )
  const sourceAccounts = governancesArray
    .filter(
      (gov) => gov.info?.accountType === GovernanceAccountType.TokenGovernance
    )
    .map((x) => x.info)
  const programId = realmInfo?.programId?.toString()
  const accountOwner = realmInfo?.realmId?.toString()

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
    onChange(form)
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
    <div className="mt-5">
      <div>Program id</div>
      <div>{form.programId}</div>
      <div>Account owner (governance account)</div>
      <div>{form.accountOwner}</div>
      <Select
        prefix="Source Account"
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'sourceAccount' })
        }
        value={form.sourceAccount?.governedAccount?.toString()}
      >
        {sourceAccounts.map((acc) => {
          const govAccount = acc.governedAccount?.toString()
          return (
            <Select.Option key={govAccount} value={acc}>
              <span>{govAccount}</span>
            </Select.Option>
          )
        })}
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
