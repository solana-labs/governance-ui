/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  DualFinanceStakingOptionForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import Input from '@components/inputs/Input'

const StakingOption = ({
  index,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceStakingOptionForm>({
    soAuthority: undefined,
    soName: undefined,
    optionExpirationUnixSeconds: 0,
    subscriptionPeriodEndUnixSeconds: 0,
    numTokens: 0,
    lotSize: 0,
    baseTreasury: undefined,
    quoteTreasury: undefined,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    const serializedInstruction = ''
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: undefined,
    }
    return obj
  }
  useEffect(() => {
    // TODO: Fill this in
    handleSetInstructions({ governedAccount: undefined, getInstruction }, index)
  }, [form])
  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <Input
        label="SO Authority"
        value={form.soAuthority}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'soAuthority',
          })
        }
        error={formErrors['soAuthority']}
      />
      <Input
        label="SO Name"
        value={form.soName}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'soName',
          })
        }
        error={formErrors['soName']}
      />
      <Input
        label="Option Expiration"
        value={form.optionExpirationUnixSeconds}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'optionExpirationUnixSeconds',
          })
        }
        error={formErrors['optionExpirationUnixSeconds']}
      />
      <Input
        label="Subscription Period End"
        value={form.subscriptionPeriodEndUnixSeconds}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'subscriptionPeriodEndUnixSeconds',
          })
        }
        error={formErrors['subscriptionPeriodEndUnixSeconds']}
      />
      <Input
        label="Num Tokens"
        value={form.numTokens}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'numTokens',
          })
        }
        error={formErrors['numTokens']}
      />
      <Input
        label="Lot Size"
        value={form.lotSize}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'lotSize',
          })
        }
        error={formErrors['lotSize']}
      />
      <Input
        label="Base Treasury"
        value={form.baseTreasury}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'baseTreasury',
          })
        }
        error={formErrors['baseTreasury']}
      />
      <Input
        label="Quote Treasury"
        value={form.quoteTreasury}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'quoteTreasury',
          })
        }
        error={formErrors['quoteTreasury']}
      />
    </>
  )
}

export default StakingOption
