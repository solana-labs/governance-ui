/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from 'react'
import * as yup from 'yup'
import { ForesightMakeAddMarketListToCategoryParams } from '@utils/uiTypes/proposalCreationTypes'
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
  ForesightMarketListIdInput,
  ForesightUseEffects,
  getSchema,
  makeHandleSetFormWithErrors,
} from './utils'

function MakeAddMarketListToCategoryParams({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const {
    wallet,
    filteredTokenAccounts,
    formErrors,
    setFormErrors,
    handleSetInstructions,
  } = commonAssets()
  const [form, setForm] = useState<ForesightMakeAddMarketListToCategoryParams>({
    governedAccount: filteredTokenAccounts[0],
    categoryId: '',
    marketListId: '',
  })
  const handleSetForm = makeHandleSetFormWithErrors(
    form,
    setForm,
    setFormErrors
  )
  const schema = getSchema({
    categoryId: yup.string().required(),
    marketListId: yup.string().required(),
  })
  async function ixCreator(
    form: ForesightMakeAddMarketListToCategoryParams,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const { ix } = await foresightGov.genAddMarketListToCategoryIx(
      Buffer.from(form.categoryId.padEnd(20)),
      Buffer.from(form.marketListId.padEnd(20)),
      program,
      form.governedAccount.transferAddress!
    )
    return ix
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
  const inputProps = {
    form,
    handleSetForm,
    formErrors,
  }

  return (
    <>
      <ForesightGovernedAccountSelect
        filteredTokenAccounts={filteredTokenAccounts}
        form={form}
        handleSetForm={handleSetForm}
        index={index}
        governance={governance}
      ></ForesightGovernedAccountSelect>
      <ForesightCategoryIdInput {...inputProps} />
      <ForesightMarketListIdInput {...inputProps} />
    </>
  )
}

export default MakeAddMarketListToCategoryParams
