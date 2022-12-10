import { Treasury } from '@mean-dao/msp'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import React, { useContext, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import getMeanWithdrawFromAccountInstruction from '@utils/instructions/Mean/getMeanWithdrawFromAccountInstruction'
import getMint from '@utils/instructions/Mean/getMint'
import { MeanWithdrawFromAccount } from '@utils/uiTypes/proposalCreationTypes'
import { getMeanWithdrawFromAccountSchema } from '@utils/validations'

import { NewProposalContext } from '../../../new'
import SelectStreamingAccount from './SelectStreamingAccount'

interface Props {
  index: number
  governance: ProgramAccount<Governance> | null
}

const MeanWithdrawFromAccountComponent = ({ index, governance }: Props) => {
  // form
  const [form, setForm] = useState<MeanWithdrawFromAccount>({
    governedTokenAccount: undefined,
    mintInfo: undefined,
    amount: undefined,
    treasury: undefined,
    destination: undefined,
  })

  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }, restForm = {}) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value, ...restForm })
  }

  // instruction
  const connection = useWalletStore((s) => s.connection)

  const schema = getMeanWithdrawFromAccountSchema({
    form,
    connection,
    mintInfo: form.mintInfo,
  })
  const { handleSetInstructions } = useContext(NewProposalContext)

  const getInstruction = () =>
    getMeanWithdrawFromAccountInstruction({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

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

  // treasury

  const shouldBeGoverned = index !== 0 && !!governance
  const formTreasury = form.treasury as Treasury | undefined

  // governedTokenAccount

  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()

  useEffect(() => {
    const value =
      formTreasury &&
      governedTokenAccountsWithoutNfts.find(
        (acc) =>
          acc.governance.pubkey.toBase58() ===
            formTreasury.treasurer.toString() && acc.isSol
      )
    setForm((prevForm) => ({
      ...prevForm,
      governedTokenAccount: value,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(governedTokenAccountsWithoutNfts), formTreasury])

  // mint info

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      mintInfo:
        formTreasury && getMint(governedTokenAccountsWithoutNfts, formTreasury),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(governedTokenAccountsWithoutNfts), formTreasury])

  return (
    <React.Fragment>
      <SelectStreamingAccount
        label="Select streaming account source"
        onChange={(treasury) => {
          handleSetForm({ value: treasury, propertyName: 'treasury' })
        }}
        value={formTreasury}
        error={formErrors['treasury']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="Destination account"
        value={form.destination}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value.trim(),
            propertyName: 'destination',
          })
        }
        error={formErrors['destination']}
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
    </React.Fragment>
  )
}

export default MeanWithdrawFromAccountComponent
