import { TreasuryType } from '@mean-dao/msp'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import React, { useContext, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import getMeanCreateAccountInstruction from '@utils/instructions/Mean/getMeanCreateAccountInstruction'
import { MeanCreateAccount } from '@utils/uiTypes/proposalCreationTypes'
import { getMeanCreateAccountSchema } from '@utils/validations'

import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'

const typeSelectOptions = [TreasuryType.Open, TreasuryType.Lock] as const

const TypeSelectOption = ({ value }: { value: TreasuryType }) => {
  const name =
    value === TreasuryType.Open
      ? 'Open money streaming account'
      : 'Locked money streaming account'
  const description =
    value === TreasuryType.Open
      ? 'With an open streaming account, you can create money streams that run indefinitely. When the account runs out of money all streams stop, until it gets replenished.'
      : 'With a locked streaming account you can create streams that act like a vesting contract for reserved allocations, like the ones needed for investors. They usually have a fixed end date.'

  return (
    <div className="text-fgd-1 ">
      <div className="mb-0.5">{name}</div>
      <div className="mb-2 text-fgd-3 text-xs">{description}</div>
    </div>
  )
}

interface TypeSelectProps {
  onChange: (value: TreasuryType) => void
  value: TreasuryType
}

const TypeSelect = ({ onChange, value }: TypeSelectProps) => {
  return (
    <Select
      onChange={onChange}
      componentLabel={<TypeSelectOption value={value} />}
      placeholder="Please select..."
      value={value}
    >
      {typeSelectOptions.map((option) => {
        return (
          <Select.Option key={option} value={option}>
            <TypeSelectOption value={option} />
          </Select.Option>
        )
      })}
    </Select>
  )
}

interface Props {
  index: number
  governance: ProgramAccount<Governance> | null
}

const MeanCreateAccountComponent = ({ index, governance }: Props) => {
  // form
  const [form, setForm] = useState<MeanCreateAccount>({
    governedTokenAccount: undefined,
    label: undefined,
    mintInfo: undefined,
    amount: undefined,
    type: TreasuryType.Open,
  })

  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  // governedTokenAccount

  const shouldBeGoverned = !!(index !== 0 && governance)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()

  // instruction

  const schema = getMeanCreateAccountSchema({ form })
  const { handleSetInstructions } = useContext(NewProposalContext)

  const connection = useWalletStore((s) => s.connection)
  const getInstruction = () =>
    getMeanCreateAccountInstruction({
      connection,
      form,
      setFormErrors,
      schema,
    })

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedTokenAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  // mint info

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)

  useEffect(() => {
    setForm({
      ...form,
      mintInfo: form.governedTokenAccount?.extensions.mint?.account,
    })
  }, [form.governedTokenAccount])

  // amount

  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          mintMinAmount,
          Math.min(Number.MAX_SAFE_INTEGER, value ?? 0)
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value,
      propertyName: 'amount',
    })
  }

  return (
    <React.Fragment>
      <Input
        label="Name your streaming account"
        value={form.label}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'label',
          })
        }
        error={formErrors['label']}
      />
      <GovernedAccountSelect
        label="Select source of funds"
        governedAccounts={governedTokenAccountsWithoutNfts.filter(
          (a) => !a.isSol
        )}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        min={mintMinAmount}
        max={Number.MAX_SAFE_INTEGER}
        label="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
        inputMode="decimal"
      />
      <TypeSelect
        value={form.type}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'type' })
        }}
      />
    </React.Fragment>
  )
}

export default MeanCreateAccountComponent
