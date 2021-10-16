import React, { useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useRealm from '@hooks/useRealm'
import { GovernanceAccountType } from '@models/accounts'
import { Token } from '@solana/spl-token'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { serializeInstructionToBase64 } from '@models/serialisation'

const SplTokenTransferForm = ({ onChange, onSourceAccountChange }) => {
  const { realmInfo, governances } = useRealm()

  const governancesArray = Object.keys(governances).map(
    (key) => governances[key]
  )
  const sourceAccounts = governancesArray
    .filter(
      (gov) => gov.info?.accountType === GovernanceAccountType.TokenGovernance
    )
    .map((x) => x)
  const programId = realmInfo?.programId

  const [form, setForm] = useState({
    destinationAccount: '',
    amount: 1,
    sourceAccount: null,
    programId: programId?.toString(),
  })

  const handleSetForm = ({ propertyName, value }) => {
    setForm({ ...form, [propertyName]: value })
  }

  useEffect(() => {
    onSourceAccountChange(form.sourceAccount)
  }, [form.sourceAccount])

  useEffect(() => {
    try {
      const mintAmount = parseMintNaturalAmountFromDecimal(form.amount, 1)
      const transferIx = Token.createTransferInstruction(
        programId,
        form.sourceAccount?.pubkey,
        new PublicKey(form.destinationAccount),
        form.sourceAccount?.info?.governedAccount,
        [],
        mintAmount
      )
      const serializedInstruction = serializeInstructionToBase64(transferIx)
      onChange(serializedInstruction)
    } catch (e) {
      console.log(e)
    }
  }, [form])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  return (
    <div className="mt-5">
      <div>Program id</div>
      <div>{form.programId}</div>
      <div>Account owner (governance account)</div>
      <div>{form.sourceAccount?.pubkey?.toString()}</div>
      <Select
        prefix="Source Account"
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'sourceAccount' })
        }
        value={form.sourceAccount?.info?.governedAccount?.toString()}
      >
        {sourceAccounts.map((acc) => {
          const govAccount = acc.pubkey.toString()
          return (
            <Select.Option key={govAccount} value={acc}>
              <span>{acc.info.governedAccount.toString()}</span>
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
