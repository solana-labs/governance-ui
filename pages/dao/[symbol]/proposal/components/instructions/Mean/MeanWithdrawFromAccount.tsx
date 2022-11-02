import { Governance, ProgramAccount } from '@solana/spl-governance'
import { Treasury } from '@mean-dao/msp'
import useWalletStore from 'stores/useWalletStore'
import React, { useContext, useEffect, useState } from 'react'

import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  MeanWithdrawFromAccount,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import getMeanWithdrawFromAccountInstruction from '@utils/instructions/Mean/getMeanWithdrawFromAccountInstruction'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import { getMeanWithdrawFromAccountSchema } from '@utils/validations'
import getMint from '@utils/instructions/Mean/getMint'

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

  const getInstruction = async (): Promise<UiInstruction> => {
    return await getMeanWithdrawFromAccountInstruction({
      connection,
      form,
      setFormErrors,
      schema,
    })
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedTokenAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  // amount

  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
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
