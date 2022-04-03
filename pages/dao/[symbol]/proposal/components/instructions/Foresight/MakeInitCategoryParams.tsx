/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from 'react'
import * as yup from 'yup'
import { ForesightHasCategoryId } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  types as foresightTypes,
} from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightCategoryIdInput,
  ForesightGovernedAccountSelect,
  ForesightUseEffects,
  getSchema,
  makeHandleSetFormWithErrors,
} from './utils'

const MakeInitCategoryParams = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const {
    wallet,
    filteredTokenAccounts,
    formErrors,
    setFormErrors,
    handleSetInstructions,
  } = commonAssets()
  const [form, setForm] = useState<ForesightHasCategoryId>({
    governedAccount: filteredTokenAccounts[0],
    categoryId: '',
  })
  const handleSetForm = makeHandleSetFormWithErrors(
    form,
    setForm,
    setFormErrors
  )
  const schema = getSchema({
    categoryId: yup.string().required(),
  })
  async function ixCreator(
    form: ForesightHasCategoryId,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const { ix } = await foresightGov.genInitCategoryIx(
      Buffer.from(form.categoryId.padEnd(20)),
      program,
      form.governedAccount.transferAddress!
    )
    return ix
  }

  const inputProps = {
    form,
    handleSetForm,
    formErrors,
  }
  ForesightUseEffects(
    handleSetForm,
    form,
    handleSetInstructions,
    ixCreator,
    wallet,
    schema,
    setFormErrors,
    index
  )

  return (
    <>
      <ForesightGovernedAccountSelect
        filteredTokenAccounts={filteredTokenAccounts}
        form={form}
        handleSetForm={handleSetForm}
        index={index}
        governance={governance}
      />
      <ForesightCategoryIdInput {...inputProps} />
    </>
  )
}

export default MakeInitCategoryParams
