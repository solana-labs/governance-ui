/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from 'react'
import * as yup from 'yup'
import { ForesightMakeAddMarketMetadataParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  types as foresightTypes,
  consts as foresightConsts,
} from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightContentInput,
  ForesightGovernedAccountSelect,
  ForesightMarketIdInput,
  ForesightMarketListIdInput,
  ForesightMarketMetadataFieldSelect,
  ForesightUseEffects,
  getSchema,
  makeHandleSetFormWithErrors,
} from './utils'

const MakeAddMarketMetadataParams = ({
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
  const [form, setForm] = useState<ForesightMakeAddMarketMetadataParams>({
    governedAccount: filteredTokenAccounts[0],
    marketListId: '',
    marketId: 0,
    content: '',
    field: Object.keys(
      foresightConsts.MARKET_METADATA_FIELDS
    )[0] as foresightConsts.MarketMetadataFieldName,
  })
  const handleSetForm = makeHandleSetFormWithErrors(
    form,
    setForm,
    setFormErrors
  )
  const schema = getSchema({
    marketId: yup.number().required(),
    marketListId: yup.string().required(),
    content: yup.string().required(),
  })
  async function ixCreator(
    form: ForesightMakeAddMarketMetadataParams,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const field = foresightConsts.MARKET_METADATA_FIELDS[form.field]
    const { ix } = await foresightGov.genWriteToFieldMarketMetadataIx(
      Uint8Array.from([form.marketId]),
      Buffer.from(form.marketListId.padEnd(20)),
      form.content,
      field,
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
      />
      <ForesightMarketIdInput {...inputProps} />
      <ForesightMarketListIdInput {...inputProps} />
      <ForesightContentInput {...inputProps} />
      <ForesightMarketMetadataFieldSelect {...inputProps} />
    </>
  )
}

export default MakeAddMarketMetadataParams
